"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Check if current user is anonymous before signing in
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const wasAnonymous = currentUser?.is_anonymous ?? false;
      const anonymousUserId = wasAnonymous ? currentUser?.id : null;

      // Sign in with password
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // If user was anonymous, reassign their sessions to the new account
      if (wasAnonymous && anonymousUserId) {
        try {
          await fetch("/api/auth/link-anonymous", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anonymousUserId }),
          });
        } catch (linkError) {
          // Non-critical error - user is logged in, just couldn't migrate data
          console.error("Failed to link anonymous sessions:", linkError);
        }
      }

      router.push("/");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-sky-600">Login</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email
            </Label>
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400"
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="ml-auto text-sm font-medium text-slate-500 underline-offset-4 hover:text-slate-700"
              >
                Forgot your password?
              </Link>
            </div>
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:bg-slate-300"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
          <div className="text-center text-sm text-slate-900">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-sky-600 underline underline-offset-4 hover:text-sky-700"
            >
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
