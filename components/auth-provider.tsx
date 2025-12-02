"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  isAnonymous: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAnonymous: false,
  isLoading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { user: existingUser } } = await supabase.auth.getUser();
        
        if (existingUser) {
          setUser(existingUser);
        } else {
          // No user - sign in anonymously
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error("Failed to sign in anonymously:", error);
          } else {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // If user signed out, sign in anonymously again
      if (event === "SIGNED_OUT") {
        supabase.auth.signInAnonymously().then(({ data }) => {
          if (data.user) {
            setUser(data.user);
          }
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAnonymous = user?.is_anonymous ?? false;

  return (
    <AuthContext.Provider value={{ user, isAnonymous, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
