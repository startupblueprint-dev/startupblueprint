"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TopBarProps = {
  fullWidth?: boolean;
  className?: string;
};

export function TopBar({ fullWidth = false, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-2 rounded-b-[24px] border border-white/70 bg-white px-6 py-1 shadow-[0_20px_80px_-50px_rgba(64,112,255,0.55)] backdrop-blur md:px-20",
        fullWidth ? "w-full" : "",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:text-sm"
          >
            Startup <span className="font-extrabold text-sky-600">Blueprint</span>
          </button>
        </div>
        <Button
          asChild
          variant="ghost"
          className="ml-auto px-0 text-sm font-semibold text-slate-500 transition-colors hover:bg-transparent hover:text-sky-600 focus-visible:bg-transparent"
        >
          <Link href="/auth/login">Login</Link>
        </Button>
      </div>
    </div>
  );
}