"use client";

import { useEffect, useState } from "react";
import { ChatInterface } from "@/components/chat-interface";

const HEADLINE_LINE1 = "Actually Build Something";
const HEADLINE_LINE2 = "That Solves ";
const TYPEWRITER_SPEED = 35; // ms per character

export function AnimatedHero() {
  const [line1Text, setLine1Text] = useState("");
  const [line2Text, setLine2Text] = useState("");
  const [showRealProblems, setShowRealProblems] = useState(false);
  const [showUnderline, setShowUnderline] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const totalLength = HEADLINE_LINE1.length + HEADLINE_LINE2.length;

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < totalLength) {
        if (i < HEADLINE_LINE1.length) {
          setLine1Text(HEADLINE_LINE1.slice(0, i + 1));
        } else {
          const line2Index = i - HEADLINE_LINE1.length;
          setLine2Text(HEADLINE_LINE2.slice(0, line2Index + 1));
        }
        i++;
      } else {
        clearInterval(interval);
        // Show "Real Problems." after headline finishes
        setShowRealProblems(true);
        // Show underline shortly after
        setTimeout(() => setShowUnderline(true), 150);
        // Show description
        setTimeout(() => setShowDescription(true), 500);
        // Show chat
        setTimeout(() => setShowChat(true), 900);
      }
    }, TYPEWRITER_SPEED);

    return () => clearInterval(interval);
  }, [totalLength]);

  const isTypingLine1 = line1Text.length < HEADLINE_LINE1.length;
  const isTypingLine2 =
    line1Text.length === HEADLINE_LINE1.length &&
    line2Text.length < HEADLINE_LINE2.length;

  return (
    <div className="space-y-6 text-center md:text-left">
      <div className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Startup <span className="font-extrabold text-sky-600">Blueprint</span>
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 md:text-5xl">
          {line1Text}
          {isTypingLine1 && <span className="animate-pulse">|</span>}
          {line1Text.length === HEADLINE_LINE1.length && (
            <>
              <br />
              {line2Text}
              {isTypingLine2 && <span className="animate-pulse">|</span>}
            </>
          )}
          {showRealProblems && (
            <span className="relative inline-block">
              <span
                className={`transition-opacity duration-300 ${
                  showRealProblems ? "opacity-100" : "opacity-0"
                }`}
              >
                Real Problems.
              </span>
              <svg
                aria-hidden="true"
                className={`pointer-events-none absolute left-1/2 top-full -mt-2 h-6 w-[350%] -translate-x-1/2 transition-all duration-500 ${
                  showUnderline
                    ? "opacity-100 [clip-path:inset(0_0_0_0)]"
                    : "opacity-0 [clip-path:inset(0_100%_0_0)]"
                }`}
                viewBox="0 0 380 26"
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
                  d="M5 15 C 20 6, 140 23, 200 12 S 330 21, 375 14"
                  stroke="url(#underlineGradient)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          )}
        </h1>
        <p
          className={`pt-2 text-base text-muted-foreground md:text-lg transition-opacity duration-500 ${
            showDescription ? "opacity-100" : "opacity-0"
          }`}
        >
          Rapid discovery questions to identify real industry pain, develop PRD
          for a globally scalable solution, and launch-ready landing pages to
          immidiately sell to your ICPs while you build.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground" />
      <div
        className={`mt-8 transition-all duration-500 ${
          showChat
            ? "translate-y-0 opacity-100"
            : "translate-y-8 opacity-0"
        }`}
      >
        <ChatInterface />
      </div>
    </div>
  );
}
