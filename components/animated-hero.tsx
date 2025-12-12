"use client";

import { useEffect, useState } from "react";
import { Caveat } from "next/font/google";
import { ChatInterface, type DocumentsStatus } from "@/components/chat-interface";
import { ArrowRight } from "lucide-react";

const HEADLINE_LINE1 = "Build Something";
const HEADLINE_LINE2 = "That Solves ";
const HEADLINE_LINE3 = "Real Problems.";
const TYPEWRITER_SPEED = 15; // ms per character

const QUOTE_PART1 = "Fall in Love with the ";
const QUOTE_PROBLEM = "Problem,";
const QUOTE_PART2 = "Not the ";
const QUOTE_SOLUTION = "Solution.";
const QUOTE_ATTRIBUTION = "- Uri Levine (Founder of Unicorns Waze and Moovit)";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

type AnimatedHeroProps = {
  onSuggestionsVisible?: (visible: boolean) => void;
  onQuoteComplete?: () => void;
  onDocumentsStatusChange?: (status: DocumentsStatus) => void;
  documentsStatus?: DocumentsStatus;
};

export function AnimatedHero({
  onSuggestionsVisible,
  onQuoteComplete,
  onDocumentsStatusChange,
  documentsStatus,
}: AnimatedHeroProps) {
  const [line1Text, setLine1Text] = useState("");
  const [line2Text, setLine2Text] = useState("");
  const [line3Text, setLine3Text] = useState("");
  const [showRealProblems, setShowRealProblems] = useState(false);
  const [showUnderline, setShowUnderline] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isQuoteVisible, setIsQuoteVisible] = useState(true);
  const [quoteHasFinished, setQuoteHasFinished] = useState(false);
  const [showQuotePart1, setShowQuotePart1] = useState(false);
  const [showQuoteUnderline, setShowQuoteUnderline] = useState(false);
  const [showQuotePart2, setShowQuotePart2] = useState(false);
  const [showQuoteStrike, setShowQuoteStrike] = useState(false);
  const [showQuoteAttribution, setShowQuoteAttribution] = useState(false);
  const [showQuoteButton, setShowQuoteButton] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);

  const totalLength =
    HEADLINE_LINE1.length + HEADLINE_LINE2.length + HEADLINE_LINE3.length;

  useEffect(() => {
    if (!isQuoteVisible) return;
    setShowQuotePart1(false);
    setShowQuoteUnderline(false);
    setShowQuotePart2(false);
    setShowQuoteStrike(false);
    setShowQuoteAttribution(false);
    setShowQuoteButton(false);

    const timers = [
      setTimeout(() => setShowQuotePart1(true), 100),
      setTimeout(() => setShowQuoteUnderline(true), 600),
      setTimeout(() => setShowQuotePart2(true), 1050),
      setTimeout(() => setShowQuoteStrike(true), 1450),
      setTimeout(() => setShowQuoteAttribution(true), 1850),
      setTimeout(() => setShowQuoteButton(true), 2300),
    ];

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [isQuoteVisible]);

  const handleQuoteContinue = () => {
    setIsQuoteVisible(false);
    setQuoteHasFinished(true);
    onQuoteComplete?.();
  };

  useEffect(() => {
    if (!quoteHasFinished) return;

    setLine1Text("");
    setLine2Text("");
    setLine3Text("");
    setShowRealProblems(false);
    setShowUnderline(false);
    setShowDescription(false);
    setShowChat(false);

    let i = 0;
    const interval = setInterval(() => {
      if (i < totalLength) {
        if (i < HEADLINE_LINE1.length) {
          setLine1Text(HEADLINE_LINE1.slice(0, i + 1));
        } else if (i < HEADLINE_LINE1.length + HEADLINE_LINE2.length) {
          const line2Index = i - HEADLINE_LINE1.length;
          setLine2Text(HEADLINE_LINE2.slice(0, line2Index + 1));
        } else {
          const line3Index =
            i - HEADLINE_LINE1.length - HEADLINE_LINE2.length;
          if (line3Index === 0) {
            setShowRealProblems(true);
          }
          setLine3Text(HEADLINE_LINE3.slice(0, line3Index + 1));
        }
        i++;
      } else {
        clearInterval(interval);
        // Show underline shortly after
        setTimeout(() => setShowUnderline(true), 150);
        // Show description
        setTimeout(() => setShowDescription(true), 500);
        // Show chat
        setTimeout(() => setShowChat(true), 900);
      }
    }, TYPEWRITER_SPEED);

    return () => clearInterval(interval);
  }, [quoteHasFinished, totalLength]);

  const isTypingLine1 = line1Text.length < HEADLINE_LINE1.length;
  const isTypingLine2 =
    line1Text.length === HEADLINE_LINE1.length &&
    line2Text.length < HEADLINE_LINE2.length;
  const isTypingLine3 =
    line1Text.length === HEADLINE_LINE1.length &&
    line2Text.length === HEADLINE_LINE2.length &&
    line3Text.length < HEADLINE_LINE3.length;

  const heroLocked = documentsStatus === "generating";
  const heroCollapsed = showSolutions || heroLocked;

  const rootClasses = heroCollapsed
    ? "relative flex w-full flex-col min-h-screen"
    : "relative flex w-full flex-col h-[520px] md:h-[640px]";

  return (
    <div className={rootClasses}>
      {isQuoteVisible ? (
        <div className="flex h-full flex-col justify-center text-center">
          <blockquote className={`w-full animate-in fade-in duration-700 ${caveat.className}`}>
            <p className="text-2xl font-semibold leading-relaxed text-slate-800 sm:text-3xl md:text-[2.5rem]">
              <span
                className={`inline-block transition-all duration-700 ${
                  showQuotePart1
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                “{QUOTE_PART1}
                <span className="relative inline-block">
                  <span className="relative z-10">{QUOTE_PROBLEM}</span>
                  <svg
                    aria-hidden="true"
                    className={`pointer-events-none absolute left-1/2 top-full -mt-5 h-6 w-[110%] -translate-x-1/2 transition-all duration-500 sm:-mt-2 sm:w-[110%] ${
                      showQuoteUnderline
                        ? "opacity-100 [clip-path:inset(0_0_0_0)]"
                        : "opacity-0 [clip-path:inset(0_100%_0_0)]"
                    }`}
                    viewBox="0 0 320 26"
                    fill="none"
                  >
                    <defs>
                      <linearGradient
                        id="quoteUnderlineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="50%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M5 15 C 20 6, 120 23, 180 12 S 280 21, 315 14"
                      stroke="url(#quoteUnderlineGradient)"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </span>
              {" "}
              <span
                className={`inline-block transition-all duration-700 ${
                  showQuotePart2
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4"
                }`}
              >
                {QUOTE_PART2}
                <span className="relative inline-flex items-center">
                  <span className="relative z-10">{QUOTE_SOLUTION}</span>
                  <span
                    className={`absolute inset-x-0 top-[60%] h-[4px] -translate-y-1/2 bg-rose-500 transition-all duration-500 sm:top-[70%] ${
                      showQuoteStrike
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0"
                    }`}
                    style={{ transformOrigin: "left" }}
                  />
                </span>
                ”
              </span>
            </p>
            <p
              className={`mt-6 text-base font-semibold text-sky-600 whitespace-nowrap transition-all duration-700 sm:text-lg ${
                showQuoteAttribution
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              {QUOTE_ATTRIBUTION}
            </p>
            <button
              type="button"
              onClick={handleQuoteContinue}
              className={`mt-8 inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg transition-all duration-100 hover:bg-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 font-sans sm:mt-8 sm:px-6 sm:py-2 sm:text-base ${
                showQuoteButton
                  ? "opacity-100 translate-y-0"
                  : "pointer-events-none opacity-0 translate-y-2"
              }`}
            >
              Get Started{" "}
              <ArrowRight className="ml-2 h-4 w-4 translate-y-[1px] text-white" />
            </button>
          </blockquote>
        </div>
      ) : (
        <>
          <div className={`absolute right-0 top-0 hidden md:right-7 md:block transition-all duration-500 ${heroCollapsed ? "!hidden" : ""}`}>
            <span className="inline-flex items-center gap-2 rounded-full border border-muted-foreground/20 bg-white px-4 py-2 text-sm text-muted-foreground shadow-[0_15px_40px_-30px_rgba(15,23,42,0.55)]">
              <span className="h-2 w-2 rounded-full bg-sky-400" /> Built for Founders
            </span>
          </div>
          <div className="flex h-full flex-col">
            <div className={`space-y-1 pt-4 md:pt-0 pl-5 pr-5 text-center md:space-y-6 md:pl-10 md:pr-10 md:text-left transition-all duration-500 ${heroCollapsed ? "hidden" : ""}`}>
              <div className="space-y-4">
                <h1 className="text-[clamp(0.9rem,5.5vw,1.2rem)] font-semibold leading-tight tracking-tight text-gray-900 sm:text-[2.5rem] sm:leading-tight">
                  <span className="block whitespace-nowrap sm:whitespace-normal">
                    {line1Text}
                    {isTypingLine1 && <span className="animate-pulse">|</span>}
                  </span>
                  {line1Text.length === HEADLINE_LINE1.length && (
                    <span className="block whitespace-nowrap sm:whitespace-normal">
                      {line2Text}
                      {isTypingLine2 && <span className="animate-pulse">|</span>}
                      {line2Text.length === HEADLINE_LINE2.length && (
                        <span className="relative inline-block">
                          <span
                            className={`transition-opacity duration-300 ${
                              showRealProblems ? "opacity-100" : "opacity-0"
                            }`}
                          >
                            {line3Text}
                            {isTypingLine3 && (
                              <span className="animate-pulse">|</span>
                            )}
                          </span>
                          <svg
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-1/2 top-full -mt-3 h-6 w-[105%] -translate-x-1/2 transition-all duration-500 sm:-mt-2 sm:w-[320%] ${
                              showUnderline
                                ? "opacity-100 [clip-path:inset(0_0_0_0)]"
                                : "opacity-0 [clip-path:inset(0_100%_0_0)]"
                            }`}
                            viewBox="0 0 320 26"
                            fill="none"
                          >
                            <defs>
                              <linearGradient
                                id="underlineGradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                              >
                                <stop offset="0%" stopColor="#f43f5e" />
                                <stop offset="50%" stopColor="#fb7185" />
                                <stop offset="100%" stopColor="#f43f5e" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M5 15 C 20 6, 120 23, 180 12 S 280 21, 315 14"
                              stroke="url(#underlineGradient)"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </span>
                  )}
                </h1>
                <p
                  className={`pt-2 text-xs text-muted-foreground sm:text-base md:text-lg transition-opacity duration-500 ${
                    showDescription ? "opacity-100" : "opacity-0"
                  }`}
                >
                  Rapid discovery questions to identify real industry pain, develop{" "}
                  <span className="group relative mx-[2px] inline-flex cursor-help items-center text-muted-foreground sm:mx-1">
                    PRD
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-600 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
                      Product Requirement Documents (PRDs) align teams on scope, goals,
                      and success metrics before any engineering begins.
                    </span>
                  </span>
                  {" "}for a globally scalable{" "}
                  <span className="group relative mx-[2px] inline-flex cursor-help items-center text-muted-foreground sm:mx-1">
                    B2B SaaS
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-60 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-600 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
                      Business-to-Business Software-as-a-Service (B2B SaaS) companies sell cloud software subscription solutions to other businesses.
                    </span>
                  </span>
                  {" "}solution, and launch-ready landing pages to
                  immediately sell to your{" "}
                  <span className="group relative mx-[2px] inline-flex cursor-help items-center text-muted-foreground sm:mx-1">
                    ICPs
                    <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-normal text-slate-600 opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 sm:block">
                      Ideal Customer Profiles (ICPs) help you target the exact buyer
                      personas who feel the pain most and convert fastest.
                    </span>
                    <span className="sr-only">Ideal Customer Profiles</span>
                  </span>
                  {" "}while you build.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground" />
            </div>
            <div
              className={`flex-1 ${heroCollapsed ? "pt-0" : "pt-2 md:pt-6"} transition-all duration-500 ${
                showChat
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              <div className="flex h-full w-full">
                <ChatInterface documentsStatus={documentsStatus} onSuggestionsVisible={(visible) => {
                  setShowSolutions(visible);
                  onSuggestionsVisible?.(visible);
                }} onDocumentsStatusChange={onDocumentsStatusChange} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
