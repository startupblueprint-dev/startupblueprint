import { ChatInterface } from "@/components/chat-interface";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
      <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#eef6ff] via-white to-[#dfefff] text-foreground">
        <div className="pointer-events-none absolute inset-0 opacity-90">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(28,78,156,0.28)_1px,_transparent_0)] bg-[length:24px_24px] blueprint-grid" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(36,74,140,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(36,74,140,0.18)_1px,transparent_1px)] bg-[length:120px_120px] opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/65 to-white" />
        </div>

        <div className="absolute top-4 right-4 z-10">
          <ThemeSwitcher />
        </div>

        <div className="relative z-10 mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16 md:px-10">
        <header className="relative overflow-hidden rounded-[32px] border border-white/70 bg-white/95 p-10 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)]">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/50 bg-sky-50 px-4 py-1 text-sm font-medium text-sky-600">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-sky-500"></span>
                Talk to Blueprint AI • Create anything.
              </div>
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">Startup Blueprint</p>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl">
                  Actually Build Something<br className="hidden md:block" /> That Solves Real Problems.
                </h1>
                <p className="text-base text-muted-foreground md:text-lg">
                  Rapid discovery questions to identify real industry pain, develop PRD for a globally scalable solution, and launch-ready landing pages to immidiately sell to your ICPs while you build.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-sky-400" /> 2.5k+ founders joined
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 px-3 py-1">
                  <span className="text-xs font-semibold text-sky-600">B2B SaaS</span> • Product Strategy • GTM
                </span>
              </div>
            </div>

            {/* Floating cards */}
            <div className="relative mx-auto flex w-full max-w-sm items-center justify-center">
              <div className="absolute -left-6 top-8 hidden w-40 rounded-2xl bg-white/95 p-4 text-sm shadow-[0_20px_60px_-30px_rgba(32,64,128,0.4)] md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-sky-300 to-blue-500"></div>
                  <div>
                    <p className="font-semibold">Fashion Ops</p>
                    <p className="text-xs text-muted-foreground">2.5k+ businesses</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {"Fashion Product Shoes Motivate".split(" ").map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative w-full rounded-[26px] border border-white/70 bg-gradient-to-br from-white to-slate-50 p-6 text-center shadow-[0_25px_80px_-50px_rgba(45,75,150,0.55)]">
                <p className="text-sm text-muted-foreground">Talk to Blueprint AI and get things done effortlessly…</p>
                <div className="mt-6 flex flex-col gap-3 text-left text-sm">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Increase Pilot Signups</p>
                      <p className="text-lg font-semibold">+35%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-sky-100" />
                  </div>
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Risk Reduced</p>
                      <p className="text-lg font-semibold text-sky-600">-68%</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-blue-100" />
                  </div>
                </div>
              </div>

              <div className="absolute -right-6 -bottom-6 hidden w-32 rounded-2xl bg-white/95 p-4 text-sm shadow-[0_20px_60px_-35px_rgba(32,64,128,0.4)] md:block">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Insight</p>
                  <p className="text-lg font-semibold text-slate-800">Launch-ready ideas</p>
                  <p className="text-xs text-muted-foreground">Delivered in minutes.</p>
                </div>
              </div>
            </div>
          </div>
        </header>

          <section>
            <ChatInterface />
          </section>
        </div>
      </main>
  );
}
