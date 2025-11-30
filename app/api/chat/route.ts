import { getGeminiModel } from "@/lib/gemini-client";
import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `The objective is to suggest a new business venture with the following criteria:
1. User has domain expertise
2. Globally scalable b2b SAAS
3. User knows at least 10 people to be immediate pilot customers

Ask the user 8 questions to get the answer to these as precise as possible.
Ask the questions 1 by 1.

Make responses short and concise to not overwhelm the user.

If the user does not know at least 10 people, then ask the user if they can easily reach 10 people. If not, then start the process again from beginning.

With the answers, suggest 3 business solutions. For each one, in table format outline pain, solution, ideal customer profile, business model/pricing and and go to market plan, current available solutions in the market (competitors), opportunities on how to be 10x better than existing solution. Outline feature list, core functions and base functions such as login etc.

Then allow the user to select which of the 3 suggestions they wish to build.
Create a 2 downloadable .md files:
1. Product Requirement Document, for tech stack next.js, Supabase, vercel, tailwind CSS, shadcn UI, lucide react icons.
Outline core functions for MVP, and future product roadmap functions.
2. High converting pain solution landing page targeted at Ideal Customer Profile.

IMPORTANT:
When you reach the final step of generating the 2 downloadable .md files, you MUST wrap the content of each file in specific XML-like tags so the application can extract them for the user.
Wrap the Product Requirement Document content in <PRD_FILE> ... </PRD_FILE>.
Wrap the Landing Page content in <LANDING_PAGE_FILE> ... </LANDING_PAGE_FILE>.
Do not put the tags inside code blocks (like \`\`\`), put them as raw text structure around the content.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Using gemini-2.5-pro as the stable model. 
    // If a specific newer model is required, change the first argument.
    const model = getGeminiModel("gemini-2.5-pro", SYSTEM_PROMPT);

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

    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessageStream(currentMessage.content);
    
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

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
