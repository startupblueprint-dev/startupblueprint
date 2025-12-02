"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FooterBarProps = {
  fullWidth?: boolean;
  className?: string;
};

export function FooterBar({ fullWidth = false, className }: FooterBarProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-t-[24px] border border-white/70 bg-white px-6 py-1 shadow-[0_-20px_80px_-50px_rgba(64,112,255,0.45)] md:px-20",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col">
        </div>
      </div>
    </div>
  );
}
