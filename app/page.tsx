"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatedHero } from "@/components/animated-hero";
import { TopBar } from "@/components/top-bar";
import type { DocumentsStatus } from "@/components/chat-interface";

export default function Home() {
  const [showSolutions, setShowSolutions] = useState(false);
  const [quoteCompleted, setQuoteCompleted] = useState(false);
  const [documentsStatus, setDocumentsStatus] = useState<DocumentsStatus>("idle");
  const desiredSolutionsVisibility = useRef(false);

  const handleSuggestionsVisible = (visible: boolean) => {
    desiredSolutionsVisibility.current = visible;
    if (documentsStatus === "generating") {
      return;
    }
    setShowSolutions(visible);
  };

  useEffect(() => {
    if (documentsStatus === "generating") {
      setShowSolutions(true);
    } else {
      setShowSolutions(desiredSolutionsVisibility.current);
    }
  }, [documentsStatus]);

  const topBarClasses = useMemo(() => {
    const visibility = quoteCompleted && documentsStatus !== "generating"
      ? "opacity-100 translate-y-0"
      : "pointer-events-none opacity-0 -translate-y-6";
    return `transition-all duration-700 ${visibility}`;
  }, [quoteCompleted, documentsStatus]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#051937] via-[#0a2a5f] to-[#0b3f83] text-foreground">
      <div className="pointer-events-none absolute inset-0 opacity-100">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(96,159,255,0.25)_1px,_transparent_0)] bg-[length:20px_20px]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(24,94,165,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(24,94,165,0.25)_1px,transparent_1px)] bg-[length:120px_120px] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1f3c]/40 to-[#01102a]" />
      </div>

      <div
        className={`relative z-10 flex flex-col gap-4 ${
          showSolutions
            ? "w-full px-4 pb-6"
            : "mx-auto max-w-5xl px-4 pb-10 md:px-10"
        }`}
      >
        <div
          className={`${topBarClasses} ${
            showSolutions ? "mx-auto w-full max-w-5xl px-8 sm:px-16" : ""
          }`}
        >
          <TopBar fullWidth={showSolutions} />
        </div>
        <div
          className={`relative overflow-hidden transition-all duration-700 ${
            showSolutions
              ? "w-full"
              : "rounded-[32px] border border-white/70 bg-white px-6 py-6 shadow-[0_30px_120px_-60px_rgba(64,112,255,0.45)] md:px-10 md:py-8"
          } ${quoteCompleted ? "translate-y-0" : "-translate-y-10"}`}
        >
          <div className={`flex flex-wrap items-center justify-between ${showSolutions ? "w-full" : "gap-6"}`}>
            <AnimatedHero
              onSuggestionsVisible={handleSuggestionsVisible}
              onQuoteComplete={() => setQuoteCompleted(true)}
              onDocumentsStatusChange={setDocumentsStatus}
              documentsStatus={documentsStatus}
            />
          </div>
          <div className="mt-6 border-t border-white/60 pt-4 text-center text-xs text-slate-500 sm:text-sm">
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/privacy-policy"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                Privacy Policy
              </Link>
              <span aria-hidden="true" className="text-slate-400">
                •
              </span>
              <Link
                href="/gdpr"
                className="font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                GDPR
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </main>
  );
}
