"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button
      onClick={logout}
      variant="ghost"
      className={cn(
        "px-0 text-sm font-semibold text-slate-500 transition-colors hover:bg-transparent hover:text-sky-600 focus-visible:bg-transparent",
        className,
      )}
    >
      Logout
    </Button>
  );
}
