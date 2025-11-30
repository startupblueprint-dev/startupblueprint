import { AnimatedHero } from "@/components/animated-hero";
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
          <div className="absolute right-8 top-8 hidden md:block">
            <span className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-[0_15px_40px_-30px_rgba(15,23,42,0.55)]">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> 2.5k+ founders joined
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-6">
            <AnimatedHero />
          </div>
        </header>
      </div>
    </main>
  );
}
