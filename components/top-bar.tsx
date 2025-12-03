"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type TopBarProps = {
  fullWidth?: boolean;
  className?: string;
};

export function TopBar({ fullWidth = false, className }: TopBarProps) {
  const [isPermanentUser, setIsPermanentUser] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = (user: { is_anonymous?: boolean } | null) => {
      // Only show logout for permanent (non-anonymous) users
      setIsPermanentUser(Boolean(user && !user.is_anonymous));
    };

    supabase.auth.getUser().then(({ data }) => {
      checkUser(data?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      checkUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:text-sm"
          >
            Startup <span className="font-extrabold text-sky-600">Blueprint</span>
          </Link>
        </div>
        {isPermanentUser ? (
          <LogoutButton className="ml-auto" />
        ) : (
          <Button
            asChild
            variant="ghost"
            className="ml-auto px-0 text-sm font-semibold text-slate-500 transition-colors hover:bg-transparent hover:text-sky-600 focus-visible:bg-transparent"
          >
            <Link href="/login">Login</Link>
          </Button>
        )}
      </div>
    </div>
  );
}