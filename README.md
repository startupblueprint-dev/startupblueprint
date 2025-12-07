# Startup Blueprint

**Startup Blueprint** is a guided AI workspace that helps founders validate real market pain, converge on actionable SaaS opportunities, and immediately spin up shipping assets like PRDs and landing-page copy. The conversational flow asks eight high-signal discovery questions, synthesizes three venture concepts, and streams download-ready Markdown deliverables.

> “Build something that solves real problems.”

## Table of contents

- [Why this exists](#why-this-exists)
- [Key features](#key-features)
- [Architecture & stack](#architecture--stack)
- [System workflow](#system-workflow)
- [Quick start](#quick-start)
- [Environment variables](#environment-variables)
- [Development scripts](#development-scripts)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Why this exists

Most founders ideate in the dark. Startup Blueprint structures the earliest phase of company creation by:

1. Forcing domain founders to articulate concrete problems, ICPs, proof of access, and pricing intuition.
2. Translating that context into three globally-scalable B2B SaaS blueprints.
3. Delivering a PRD + landing page so teams can pitch, sell, or test demand immediately.

## Key features

1. **Guided 8-question discovery loop** — Typewriter hero introduces a conversational questionnaire that adapts based on answers and ensures the user can reach at least 10 ICPs.
2. **Suggestion engine** — After discovery, Gemini 2.5 Pro returns three venture concepts with structured fields (Pain, Solution, ICP, GTM, etc.).
3. **Deliverable generation** — The same response streams embedded `<PRD_FILE>` and `<LANDING_PAGE_FILE>` blocks that are parsed client-side into download buttons.
4. **Shadcn/Tailwind UI** — Premium glassmorphism treatment with ThemeSwitcher, animated hero headline, and responsive cards.
5. **Supabase-ready auth scaffolding** — App Router + `@supabase/ssr` helpers are configured for future gated areas (see `app/auth` and `lib/supabase`).

## Architecture & stack

| Layer | Details |
| --- | --- |
| Frontend | Next.js App Router, React 19, Tailwind CSS, shadcn/ui, lucide-react icons, next-themes for dark/system mode. |
| AI layer | Google Gemini via `@google/generative-ai`. Flash model handles discovery; Pro model handles synthesis + deliverables. Streaming handled in `app/api/chat/route.ts`. |
| State & UX | `components/chat-interface.tsx` manages question progression, streaming updates, JSON parsing, and file downloads using ReactMarkdown + remark-gfm. |
| Backend glue | `lib/gemini-client.ts` centralizes model selection; Supabase client/server helpers live in `lib/supabase`. |

## System workflow

1. **Discovery phase (turns ≤ 8):** `BASE_PROMPT` steers Gemini Flash to ask one question at a time. The UI tracks progress (e.g., `questionNumber/8`).
2. **Validation phase:** If founder cannot reach 10 prospects, Gemini loops back to restart discovery.
3. **Synthesis phase (turns > 8):** Chat route swaps to Gemini 2.5 Pro with `FINAL_PROMPT_APPENDIX`, requesting a strict JSON payload that contains:
   - Intro copy
   - `suggestions[]` with `fields` for Pain, Solution, ICP, Pricing, GTM, etc.
   - `selectionPrompt`
   - `prd_file` and `landing_page_file` strings wrapped in XML-style tags
4. **UI rendering:** `ChatInterface` parses the JSON, renders cards for each suggestion, and exposes download buttons that turn the Markdown blobs into files.

## Quick start

```bash
pnpm install        # or npm install / yarn
cp .env.example .env.local  # if you keep a template
# Populate the variables listed below
pnpm dev            # runs Next.js at http://localhost:3000
```

The repo already includes `app`, `components`, and Supabase helpers—no need to scaffold anything else.

## Environment variables

Create `.env.local` with the following values (Vercel also supports these names):

```env
NEXT_PUBLIC_SUPABASE_URL=<your Supabase project URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<anon or publishable key>
GEMINI_API_KEY=<Google AI Studio key>
```

Notes:

1. Supabase currently issues legacy `...ANON_KEY`; you can paste it into the publishable slot while migrating.
2. `GEMINI_API_KEY` powers both Flash and Pro models—ensure the key has access to `gemini-2.5-flash` and `gemini-2.5-pro`.
3. Do **not** commit `.env.local`.

## Development scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Next.js dev server with HMR. |
| `pnpm build` | Production build + type check. |
| `pnpm start` | Starts the compiled app. |
| `pnpm lint` | Runs ESLint with Next.js config. |

## Project structure

```
startupblueprint/
├─ app/
│  ├─ api/chat/route.ts          # Streaming Gemini orchestrator
│  ├─ auth/*                     # Supabase auth routes (login, signup, etc.)
│  ├─ layout.tsx / page.tsx      # ThemeProvider + hero landing page
│  └─ globals.css                # Tailwind base styles & blueprint background
├─ components/
│  ├─ animated-hero.tsx          # Typewriter headline + chat mount animation
│  ├─ chat-interface.tsx         # Core discovery UI + result cards
│  └─ ui/*                       # shadcn/ui primitives
├─ lib/
│  ├─ gemini-client.ts           # Helper to fetch configured Gemini models
│  └─ supabase/*                 # Browser/server clients for future auth gating
├─ tailwind.config.ts            # Tailwind + shadcn presets
└─ components.json               # shadcn/ui registry
```

## Troubleshooting

1. **Streaming hangs** – Confirm the Gemini key is valid and the model names (`gemini-2.5-flash`, `gemini-2.5-pro`) are enabled for the project.
2. **Supabase auth cookies fail** – When deploying on Vercel, ensure `NEXT_PUBLIC_SUPABASE_*` vars are set in both “Environment Variables” and “Edge Config” if using the integration.
3. **shadcn styles missing** – Delete `components.json` only if you plan to reinstall the UI kit; otherwise keep it in sync with generated components.

---

Feel free to open issues or PRs to expand the idea selection prompts, add persistence for interview answers, or wire up Supabase auth for saved workspaces.
