"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { supabase } from "@/services/supabase/client";

type AuthContextType = {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);


export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // ------------------------------------------
    // AUTH STATE LISTENER
    // ------------------------------------------

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;

        console.log(
          "AUTH STATE:",
          event,
          session?.user?.email
        );

        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // ------------------------------------------
    // INITIAL SESSION
    // ------------------------------------------

    const loadSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "AUTH SESSION ERROR:",
            error
          );
        }

        if (!mounted) return;

        console.log(
          "INITIAL SESSION:",
          session?.user?.email
        );

        setUser(session?.user ?? null);
        setLoading(false);
      } catch (error) {
        console.error(
          "AUTH LOAD ERROR:",
          error
        );

        if (!mounted) return;

        setUser(null);
        setLoading(false);
      }
    };

    loadSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const logout = async () => {
    try {
      const { error } =
        await supabase.auth.signOut();

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