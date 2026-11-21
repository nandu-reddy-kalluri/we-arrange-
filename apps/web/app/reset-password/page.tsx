"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { supabase } from "@/services/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    <main className="min-h-screen flex items-center justify-center bg-[#FAF9F6] px-4 py-12 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-[#8B263E]/15 bg-white p-6 sm:p-8 shadow-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto mb-3 font-serif text-xl font-bold border border-[#C5A880]/30">
            YM
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
            YouMarriage WeArrange
          </p>
          <h1 className="mt-1.5 font-serif text-2xl sm:text-3xl font-bold text-[#2D2D2D]">
            Reset Password
          </h1>
          <p className="mt-1.5 text-xs text-neutral-600">
            Enter and confirm a strong new password (at least 8 characters) for your account.
          </p>
        </div>

        {checkingSession ? (
          <div className="mt-6 py-6 flex flex-col items-center gap-2 text-xs text-neutral-500">
            <Loader2 className="w-5 h-5 animate-spin text-[#8B263E]" />
            <span>Checking your reset link...</span>
          </div>
        ) : ready ? (
          <form onSubmit={handleUpdatePassword} className="mt-6 flex flex-col gap-4">
            <div>
              <label
                htmlFor="reset-new-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="reset-new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-10 pr-11 text-sm text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide new password" : "Show new password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-400 hover:text-[#8B263E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  id="reset-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full h-11 rounded-xl border border-neutral-200 bg-white pl-10 pr-11 text-sm text-[#2D2D2D] outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-400 hover:text-[#8B263E] cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 h-11 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-xs font-bold uppercase tracking-wider text-white transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? "Updating Password..." : "Update Password"}</span>
            </button>
          </form>
        ) : null}

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-700">
            {message}
          </p>
        )}

        {!ready && !checkingSession && (
          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-5 w-full h-10 rounded-full border border-[#8B263E]/25 text-xs font-semibold text-[#8B263E] hover:bg-[#F5EEE7] cursor-pointer"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </main>
  );
}
