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

const FINAL_PROMPT_APPENDIX = `
With the answers, suggest 3 business solutions. For each one, outline pain, solution, ideal customer profile, business model/pricing, go to market plan, current solutions, 10x better opportunity, and feature list (core + base).

You must return your response STRICTLY as JSON (no commentary before or after, no code fences). Use this structure:
{
  "intro": "short paragraph",
  "suggestions": [
    {
      "title": "",
      "summary": "one sentence",
      "fields": {
        "Pain": "",
        "Solution": "",
        "Ideal Customer Profile": "",
        "Business Model/Pricing": "",
        "Go-to-Market Plan": "",
        "Current Solutions": "",
        "10x Better Opportunity": "",
        "Feature List": {
          "Core": ["Feature one", "Feature two"],
          "Base": ["Feature three", "Feature four"]
        }
      }
    }
  ],
  "selectionPrompt": "Ask user which suggestion they want to build",
  "prd_file": "<PRD_FILE>...content...</PRD_FILE>",
  "landing_page_file": "<LANDING_PAGE_FILE>...content...</LANDING_PAGE_FILE>"
}

IMPORTANT for Feature List:
- Each feature must be a complete sentence/phrase; never split a feature across array items.
- Preserve acronyms like AI, API, ML, etc. in uppercase.
- Do not use hyphens or line breaks inside a single feature string.

Do not wrap the JSON in \`\`\`. The prd_file and landing_page_file values MUST include those XML-like tags exactly. Do not include any additional prose outside the JSON object.
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
    const inDiscoveryPhase = userTurnCount <= 8;
    const modelFallbacks = inDiscoveryPhase
      ? ["gemini-2.5-flash", "gemini-1.5-flash"]
      : ["gemini-2.5-pro", "gemini-1.5-pro"];
    const systemPrompt = inDiscoveryPhase ? BASE_PROMPT : `${BASE_PROMPT}\n\n${FINAL_PROMPT_APPENDIX}`;

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
