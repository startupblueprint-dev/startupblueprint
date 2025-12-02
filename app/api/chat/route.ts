import { getGeminiModel } from "@/lib/gemini-client";
import { NextResponse } from "next/server";
import { performance } from "perf_hooks";

const BASE_PROMPT = `The objective is to suggest a new business venture with the following criteria:
1. User has domain expertise
2. Globally scalable b2b SAAS
3. User knows at least 10 people to be immediate pilot customers

Ask the user 8 questions to get the answer to these as precise as possible.
Ask the questions 1 by 1.

Do not make any response to user.

If the user does not know at least 10 people, then ask the user if they can easily reach 10 people. If not, then start the process again from beginning.
`;

const SUGGESTIONS_PROMPT = `
With the answers, suggest 3 business solutions. For each one, outline pain, solution, ideal customer profile, business model/pricing, go to market plan, current solutions, 10x better opportunity, and feature list (core + base).

You must return your response STRICTLY as JSON (no commentary before or after, no code fences). Use this structure:
{
  "intro": "short paragraph summarizing the analysis",
  "problemTags": ["Tag1", "Tag2", "Tag3"],
  "suggestions": [
    {
      "title": "Solution Name",
      "summary": "one sentence description",
      "tags": ["Tag1", "Tag2", "Tag3"],
      "fields": {
        "Pain": "description of the pain point",
        "Solution": "description of the solution",
        "Ideal Customer Profile": "who is the target customer",
        "Business Model/Pricing": "how will it make money",
        "Go-to-Market Plan": "how to reach customers",
        "Current Solutions": "what exists today",
        "10x Better Opportunity": "why this is significantly better",
        "Feature List": {
          "Core": ["Feature one", "Feature two"],
          "Base": ["Feature three", "Feature four"]
        }
      }
    }
  ],
  "selectionPrompt": "Which solution would you like to build? Reply with 1, 2, or 3."
}

IMPORTANT:
- Each feature must be a complete sentence/phrase; never split a feature across array items.
- Preserve acronyms like AI, API, ML, etc. in uppercase.
- Do not use hyphens or line breaks inside a single feature string.
- Do not wrap the JSON in \`\`\`.
- Do not include any additional prose outside the JSON object.
- Do NOT generate PRD or Landing Page content yet - wait for user to select a solution first.
- "problemTags" should be 3 short, relevant category tags (e.g., "Healthcare", "B2B SaaS", "Automation") that describe the problem space based on user answers.
- Each suggestion's "tags" should be 3 short, relevant category tags (e.g., "AI-Powered", "Enterprise", "Analytics") that describe that specific solution.
`;

const GENERATE_DOCS_PROMPT = `
The user has selected a solution. Generate a detailed PRD (Product Requirements Document) and a Landing Page copy for the selected solution.

Return your response with these exact XML-like tags:

<PRD_FILE>
# Product Requirements Document

## Overview
[Detailed product overview]

## Problem Statement
[The pain point being solved]

## Solution
[Detailed solution description]

## Target Users
[Ideal customer profile]

## Features
### Core Features
[List of core features with descriptions]

### Base Features
[List of base features with descriptions]

## Business Model
[Pricing and revenue model]

## Go-to-Market Strategy
[How to reach customers]

## Success Metrics
[KPIs and success criteria]

## Technical Requirements
[High-level technical considerations]
</PRD_FILE>

<LANDING_PAGE_FILE>
# [Product Name]

## Hero Section
[Compelling headline and subheadline]

## Problem
[Pain point description]

## Solution
[How the product solves it]

## Features
[Key features with benefits]

## How It Works
[Simple steps]

## Pricing
[Pricing tiers]

## Call to Action
[CTA copy]

## FAQ
[Common questions and answers]
</LANDING_PAGE_FILE>

Before the tags, include a brief confirmation message like "Great choice! Here are your documents for [Solution Name]:".
`;

const shouldRetryWithFallback = (error: unknown) => {
  if (!error) return false;
  const status = (error as any)?.status ?? (error as any)?.response?.status;
  if (status === 404) return true;
  const message =
    typeof error === "string"
      ? error
      : (error as Error)?.message ?? (error as any)?.response?.statusText ?? "";
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("unsupported model");
};

const streamWithModel = async (
  modelName: string,
  systemPrompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  currentMessage: { content: string }
) => {
  const model = getGeminiModel(modelName, systemPrompt);
  const chat = model.startChat({ history });
  return chat.sendMessageStream(currentMessage.content);
};

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const userTurnCount = messages.filter((m: any) => m.role === 'user').length;
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    
    // Check if user is selecting a solution (1, 2, or 3)
    const isSelectingSolution = /^\s*[123]\s*$/.test(lastUserMessage.trim()) || 
      /solution\s*[123]/i.test(lastUserMessage) ||
      /pick\s*(solution)?\s*[123]/i.test(lastUserMessage) ||
      /choose\s*(solution)?\s*[123]/i.test(lastUserMessage) ||
      /go\s*with\s*(solution)?\s*[123]/i.test(lastUserMessage) ||
      /option\s*[123]/i.test(lastUserMessage);
    
    // Check if suggestions were already shown (look for JSON with suggestions in history)
    const hasSuggestionsInHistory = messages.some((m: any) => 
      m.role === 'model' && m.content?.includes('"suggestions"')
    );
    
    const inDiscoveryPhase = userTurnCount <= 8;
    const inSuggestionPhase = userTurnCount === 9 && !hasSuggestionsInHistory;
    const inDocGenerationPhase = hasSuggestionsInHistory && isSelectingSolution;
    
    let systemPrompt: string;
    let modelFallbacks: string[];
    
    if (inDocGenerationPhase) {
      // User selected a solution, generate PRD and Landing Page
      systemPrompt = `${BASE_PROMPT}\n\n${GENERATE_DOCS_PROMPT}`;
      modelFallbacks = ["gemini-2.5-pro", "gemini-2.5-flash"];
    } else if (inDiscoveryPhase) {
      // Still asking questions
      systemPrompt = BASE_PROMPT;
      modelFallbacks = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];
    } else {
      // Generate suggestions (after 8 questions)
      systemPrompt = `${BASE_PROMPT}\n\n${SUGGESTIONS_PROMPT}`;
      modelFallbacks = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
    }

    // Separate the last message (current user prompt) from history
    const currentMessage = messages[messages.length - 1];
    const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

    for (const message of messages.slice(0, -1)) {
      const role = message.role === 'user' ? 'user' : 'model';

      // Gemini requires the conversation to start with the user, so skip
      // any leading assistant message that was just a greeting.
      if (history.length === 0 && role === 'model') {
        continue;
      }

      // Ensure alternating roles to avoid API errors when two consecutive
      // messages come from the same speaker (e.g., streaming updates).
      const lastHistoryEntry = history[history.length - 1];
      if (lastHistoryEntry && lastHistoryEntry.role === role) {
        continue;
      }

      history.push({
        role,
        parts: [{ text: message.content }],
      });
    }

    const requestStart = performance.now();

    let result: Awaited<ReturnType<typeof streamWithModel>> | null = null;
    let resolvedModelName = "";
    let lastError: unknown;

    for (const candidate of modelFallbacks) {
      try {
        result = await streamWithModel(candidate, systemPrompt, history, currentMessage);
        resolvedModelName = candidate;
        break;
      } catch (error) {
        lastError = error;
        if (!shouldRetryWithFallback(error)) {
          throw error;
        }
        console.warn(`[Gemini] Model ${candidate} unavailable, trying fallback`, error);
      }
    }

    if (!result) {
      throw lastError ?? new Error("All Gemini model attempts failed");
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(chunkText);
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        }
      },
    });

    const response = new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

    console.log("/api/chat latency", resolvedModelName, `${(performance.now() - requestStart).toFixed(0)}ms`);
    return response;

  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
