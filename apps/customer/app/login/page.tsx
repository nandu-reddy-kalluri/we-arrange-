"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@we-arrange/api-client";
import { supabase, useAuth } from "@we-arrange/auth";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User } from "lucide-react";

const PUBLIC_WEB_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

function sanitizeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/overview";
  }
  return raw === "/login" || raw === "/register" ? "/overview" : raw;
}

function CustomerAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const redirectTarget = sanitizeRedirect(searchParams.get("redirect"));

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setMode(searchParams.get("mode") === "signup" ? "signup" : "signin");
  }, [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTarget);
    }
  }, [loading, user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setNotice(null);
    setSubmitting(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Please enter your email address.");
      if (!password) throw new Error("Please enter your password.");

      if (mode === "signup") {
        if (fullName.trim().length < 2) {
          throw new Error("Full name must be at least 2 characters.");
        }
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }

        const cleanPhone = phone.trim();
        const formattedPhone = cleanPhone
          ? cleanPhone.startsWith("+")
            ? cleanPhone
            : `+91${cleanPhone.replace(/^91/, "")}`
          : undefined;

        const regRes = await apiClient.post<{
          userId: string;
          requiresEmailConfirmation: boolean;
        }>("/api/auth/register", {
          accountType: "customer",
          fullName: fullName.trim(),
          email: normalizedEmail,
          ...(formattedPhone ? { phone: formattedPhone } : {}),
          password,
        });

        if (!regRes.ok || !regRes.data) {
          throw new Error(regRes.error || "Unable to create customer account.");
        }

        if (regRes.data.requiresEmailConfirmation) {
          setNotice("Account created. Please confirm your email before signing in.");
          setMode("signin");
          setSubmitting(false);
          return;
        }
      }

      const loginRes = await apiClient.post("/api/auth/login", {
        email: normalizedEmail,
        password,
      });

      if (!loginRes.ok) {
        throw new Error(loginRes.error || "Invalid email or password.");
      }

      const { error: clientErr } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (clientErr) {
        throw clientErr;
      }

      router.replace(redirectTarget);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed.");
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    setError(null);
    setNotice(null);
    if (!normalizedEmail) {
      setError("Enter your email address first so we can send a password reset link.");
      return;
    }
    setResettingPassword(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${PUBLIC_WEB_URL}/reset-password`,
      });
      if (resetError) throw resetError;
      setNotice(`Password reset link sent to ${normalizedEmail}. Check your inbox.`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to send password reset email right now."
      );
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center px-4 py-10 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#8B263E]/15 shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto mb-3 font-serif text-xl font-bold border border-[#C5A880]/30">
            YM
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
            YouMarriage WeArrange
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-serif font-bold text-[#2D2D2D]">
            {mode === "signup" ? "Create Customer Account" : "Customer Sign In"}
          </h1>
          <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
            {mode === "signup"
              ? "Save venues, manage your wedding shortlist, and coordinate concierge quotes."
              : "Access your saved shortlist, concierge requests, and account settings."}
          </p>
        </div>

        <div className="flex rounded-xl bg-[#F5EEE7] p-1 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === "signin" ? "bg-white text-[#8B263E] shadow-sm" : "text-neutral-600"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
              setNotice(null);
            }}
            className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
              mode === "signup" ? "bg-white text-[#8B263E] shadow-sm" : "text-neutral-600"
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}
        {notice && (
          <div role="status" className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div>
                <label
                  htmlFor="customer-auth-fullname"
                  className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="customer-auth-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Asha Rao"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="customer-auth-phone"
                  className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5"
                >
                  Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                  <input
                    id="customer-auth-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label
              htmlFor="customer-auth-email"
              className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="customer-auth-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label
                htmlFor="customer-auth-password"
                className="block text-[11px] font-bold text-neutral-600 uppercase tracking-wider"
              >
                Password
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => void handleForgotPassword()}
                  disabled={resettingPassword || submitting}
                  className="text-[11px] font-semibold text-[#8B263E] hover:underline cursor-pointer disabled:opacity-50"
                >
                  {resettingPassword ? "Sending..." : "Forgot password?"}
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                id="customer-auth-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={mode === "signup" ? 8 : 6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "At least 8 characters" : "Enter password"}
                className="w-full h-11 pl-10 pr-11 rounded-xl border border-neutral-200 text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-400 hover:text-[#8B263E] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === "signup" && (
              <p className="mt-1 text-[11px] text-neutral-500">
                Use at least 8 characters to protect your shortlist and bookings.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-11 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer shadow-sm"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === "signup" ? "Create Account" : "Sign In"}</span>
          </button>
        </form>
      </div>
    </main>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#8B263E]" />
        </main>
      }
    >
      <CustomerAuthContent />
    </Suspense>
  );
}
