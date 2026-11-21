"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { apiClient, registerAccessTokenProvider } from "@we-arrange/api-client";
import { supabase } from "./supabaseClient";

export interface AuthContextType {
  user: SupabaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getSessionAccessToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  if (typeof window !== "undefined") {
    registerAccessTokenProvider(getSessionAccessToken);
  }

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    registerAccessTokenProvider(getSessionAccessToken);

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch (error) {
      console.error("AUTH LISTENER ERROR:", error);
      setUser(null);
      setLoading(false);
    }

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("AUTH SESSION ERROR:", error);
        }

        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error("AUTH LOAD ERROR:", error);
        if (!mounted) return;
        setUser(null);
        setLoading(false);
      }
    };

    void loadSession();

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      await apiClient.logout().catch(() => undefined);
      if (error) {
        console.error("LOGOUT ERROR:", error);
        throw error;
      }
      setUser(null);
    } catch (error) {
      console.error("LOGOUT FAILED:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
