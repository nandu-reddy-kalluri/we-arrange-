"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/services/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const checkRecoverySession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;

      if (sessionError || !data.session) {
        setError(
          "This password reset link is invalid or has expired. Please request a new reset link from the sign-in page."
        );
        setReady(false);
      } else {
        setReady(true);
      }
      setCheckingSession(false);
    };

    checkRecoverySession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        setReady(true);
        setError("");
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      setMessage("Your password has been changed successfully. You can now sign in with your new password.");
      setPassword("");
      setConfirmPassword("");
      window.setTimeout(() => router.replace("/login"), 1800);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update password. Please request a new reset link and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0C0B0A] px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141210] p-6 sm:p-8 shadow-2xl">
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#FDFBF7]">RESET PASSWORD</h1>
        <p className="mt-2 text-sm text-[#FDFBF7]/65">Enter and confirm your new password below.</p>

        {checkingSession ? (
          <p className="mt-6 text-sm text-[#FDFBF7]/70">Checking your reset link...</p>
        ) : ready ? (
          <form onSubmit={handleUpdatePassword} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm text-[#FDFBF7]/80">
              New password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-[#C6934A]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-[#FDFBF7]/80">
              Confirm new password
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter new password"
                className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none focus:border-[#C6934A]"
              />
            </label>
            <button type="submit" disabled={loading} className="h-12 rounded-lg bg-[#C6934A] font-semibold text-[#111111] transition-colors hover:bg-[#B3833E] disabled:opacity-60">
              {loading ? "UPDATING PASSWORD..." : "UPDATE PASSWORD"}
            </button>
          </form>
        ) : null}

        {error && <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
        {message && <p role="status" className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}

        {!ready && !checkingSession && (
          <button type="button" onClick={() => router.replace("/login")} className="mt-5 text-sm text-[#C6934A] hover:text-[#E2B777]">Back to sign in</button>
        )}
      </div>
    </main>
  );
}
