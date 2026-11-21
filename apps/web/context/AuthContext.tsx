"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { apiClient, registerAccessTokenProvider } from "@we-arrange/api-client";
import { supabase } from "@/services/supabase/client";

type AuthContextType = {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


const getSessionAccessToken = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
};

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (typeof window !== "undefined") {
    registerAccessTokenProvider(getSessionAccessToken);
  }

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    registerAccessTokenProvider(getSessionAccessToken);

    let initialHandled = false;

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        initialHandled = true;
        setUser(session?.user ?? null);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();
    } catch (error) {
      console.error("AUTH LISTENER ERROR:", error);
      initialHandled = true;
      setUser(null);
      setLoading(false);
    }

    // Fallback only if onAuthStateChange hasn't resolved within 200ms
    const timer = setTimeout(async () => {
      if (!mounted || initialHandled) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted || initialHandled) return;
        setUser(session?.user ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsubscribe?.();
    };
  }, []);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const logout = async () => {
    try {
      const { error } =
        await supabase.auth.signOut();
      await apiClient.logout().catch(() => undefined);

      if (error) {
        console.error(
          "LOGOUT ERROR:",
          error
        );

        throw error;
      }

      setUser(null);

      console.log("USER LOGGED OUT");
    } catch (error) {
      console.error(
        "LOGOUT FAILED:",
        error
      );

      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
}