"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type TopBarLink = {
  label: string;
  href: string;
};

export type TopBarProps = {
  fullWidth?: boolean;
  className?: string;
  links?: TopBarLink[];
};

const DEFAULT_LINKS: TopBarLink[] = [
  { label: "The Wall", href: "/wall" },
];

export function TopBar({ fullWidth = false, className, links = DEFAULT_LINKS }: TopBarProps) {
  const [isPermanentUser, setIsPermanentUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = (user: { is_anonymous?: boolean } | null) => {
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
        {links.length > 0 && (
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 sm:text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="ml-auto hidden items-center gap-2 md:flex">
          {isPermanentUser ? (
            <LogoutButton />
          ) : (
            <Button
              asChild
              variant="ghost"
              className="px-0 text-sm font-semibold text-slate-500 transition-colors hover:bg-transparent hover:text-sky-600 focus-visible:bg-transparent"
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
        <div className="ml-auto flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-slate-600 hover:text-slate-900 focus-visible:ring-sky-500"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="flex flex-col items-end gap-2 rounded-2xl border border-slate-100 bg-white/80 p-3 text-right shadow-[0_10px_40px_-30px_rgba(15,23,42,0.55)] md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="w-full rounded-xl px-3 py-2 text-right text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {isPermanentUser ? (
            <LogoutButton
              className="w-full justify-end px-3 text-sm text-slate-700 hover:text-sky-600"
              onClick={() => setMobileMenuOpen(false)}
            />
          ) : (
            <Button
              asChild
              variant="ghost"
              className="w-full justify-end px-3 text-sm font-semibold text-slate-700 hover:text-sky-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/login">Login</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
