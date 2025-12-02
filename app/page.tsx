"use client";

import { useMemo, useState } from "react";
import { AnimatedHero } from "@/components/animated-hero";
import { FooterBar } from "@/components/footer-bar";
import { TopBar } from "@/components/top-bar";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  const [showSolutions, setShowSolutions] = useState(false);
  const [quoteCompleted, setQuoteCompleted] = useState(false);

  const topBarClasses = useMemo(() => {
    const visibility = quoteCompleted
      ? "opacity-100 translate-y-0"
      : "pointer-events-none opacity-0 -translate-y-6";
    return `transition-all duration-700 ${visibility}`;
  }, [quoteCompleted]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#051937] via-[#0a2a5f] to-[#0b3f83] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(96,159,255,0.25)_1px,_transparent_0)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(24,94,165,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(24,94,165,0.25)_1px,transparent_1px)] bg-[length:120px_120px] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1f3c]/40 to-[#01102a]" />
      </div>

      <div className="absolute top-4 right-4 z-20 hidden md:block">
        <ThemeSwitcher />
      </div>
      <div className="fixed inset-x-0 bottom-4 z-10 flex justify-center md:hidden">
        <ThemeSwitcher />
      </div>

      <div
        className={`relative z-10 flex flex-col gap-6 ${
          showSolutions
            ? "w-full px-4 pb-6"
            : "mx-auto max-w-5xl px-4 pb-10 md:px-10"
        }`}
      >
        <div className={topBarClasses}>
          <TopBar fullWidth={showSolutions} />
        </div>
        <div
          className={`relative overflow-hidden transition-all duration-700 ${
            showSolutions
              ? "w-full"
              : "rounded-[32px] border border-white/70 bg-white px-6 pb-10 pt-8 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)] md:p-10"
          } ${quoteCompleted ? "translate-y-0" : "-translate-y-10"}`}
        >
          <div className={`flex flex-wrap items-center justify-between ${showSolutions ? "w-full" : "gap-6"}`}>
            <AnimatedHero
              onSuggestionsVisible={setShowSolutions}
              onQuoteComplete={() => setQuoteCompleted(true)}
            />
          </div>
        </div>
        <FooterBar fullWidth={showSolutions} className="mt-4" />
      </div>
    </main>
  );
}
