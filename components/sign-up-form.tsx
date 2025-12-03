"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Check if current user is anonymous
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const isAnonymous = currentUser?.is_anonymous ?? false;

      if (isAnonymous) {
        // Link email/password to anonymous user (converts them to permanent user)
        const { error: updateError } = await supabase.auth.updateUser({
          email,
          password,
        });
        if (updateError) throw updateError;
        
        // Redirect to home - user is now permanent with all their data intact
        router.push("/");
      } else {
        // Standard sign up for non-anonymous users
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;
        router.push("/auth/sign-up-success");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold text-sky-600">Sign up</h1>
        <form onSubmit={handleSignUp} className="space-y-6">
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
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400"
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password" className="text-sm font-medium text-slate-700">
              Repeat Password
            </Label>
            <Input
              className="bg-white text-slate-900 placeholder:text-slate-400"
              id="repeat-password"
              type="password"
              required
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-sky-600 text-white transition-colors hover:bg-sky-700 disabled:bg-slate-300"
            disabled={isLoading}
          >
            {isLoading ? "Creating an account..." : "Sign up"}
          </Button>
          <div className="text-center text-sm text-slate-900">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-sky-600 underline underline-offset-4 hover:text-sky-700"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
