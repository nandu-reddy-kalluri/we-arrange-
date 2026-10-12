"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  KeyRound,
} from "lucide-react";

type AuthMode = "login" | "forgot_email" | "forgot_otp" | "forgot_new_password" | "forgot_success";

export default function AdminLoginPage() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<AuthMode>("login");

  // Login Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password / OTP State
  const [resetEmail, setResetEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Cooldown & Expiration Timers
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState(600); // 10 minutes

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // OTP input refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownSeconds > 0) {
      interval = setInterval(() => {
        setCooldownSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownSeconds]);

  // Expiration timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === "forgot_otp" && otpExpirySeconds > 0) {
      interval = setInterval(() => {
        setOtpExpirySeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, otpExpirySeconds]);

  // Check for password change notification & reset tab session on login screen
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("ymwa_admin_tab_authenticated");
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "password_changed") {
        setSuccessMsg("✓ Password updated successfully. Please log in with your new password.");
      }
    }
  }, []);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── 1. Handle Admin Login ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter the admin email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter the admin master password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Access denied.");
        setIsLoading(false);
        return;
      }

      // Successful login -> register active tab session & redirect to dashboard
      sessionStorage.setItem("ymwa_admin_tab_authenticated", "true");
      router.push("/concierge-portal");
      router.refresh();
    } catch {
      setError("Authentication failed. Please verify network connection and retry.");
      setIsLoading(false);
    }
  };

  // ── 2. Handle Request OTP (Forgot Password Step 1) ─────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = (resetEmail || email).trim();
    if (!targetEmail) {
      setError("Please enter the registered admin email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to process request.");
        if (data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
        }
        setIsLoading(false);
        return;
      }

      setResetEmail(targetEmail);
      setCooldownSeconds(data.cooldownSeconds || 60);
      setOtpExpirySeconds(600);
      setOtpDigits(["", "", "", "", "", ""]);
      setMode("forgot_otp");
      setSuccessMsg("A 6-digit verification code has been dispatched to your email.");
      setIsLoading(false);

      // Focus first OTP field
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch {
      setError("Network error requesting verification code. Please retry.");
      setIsLoading(false);
    }
  };

  // ── 3. Handle Resend OTP ───────────────────────────────────────────
  const handleResendOtp = async () => {
    if (cooldownSeconds > 0 || isLoading) return;
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to resend verification code.");
        if (data.cooldownRemaining) {
          setCooldownSeconds(data.cooldownRemaining);
        }
        setIsLoading(false);
        return;
      }

      setCooldownSeconds(data.cooldownSeconds || 60);
      setOtpExpirySeconds(600);
      setSuccessMsg("A new 6-digit verification code has been generated.");
      setIsLoading(false);
    } catch {
      setError("Failed to resend code. Please retry.");
      setIsLoading(false);
    }
  };

  // ── 4. Handle OTP Digits Change ────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric
    const char = value.replace(/\D/g, "").slice(-1);
    const updated = [...otpDigits];
    updated[index] = char;
    setOtpDigits(updated);

    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = pasted[i] || "";
    }
    setOtpDigits(updated);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // ── 5. Handle Verify OTP (Forgot Password Step 2) ──────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join("");
    if (enteredOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail, otp: enteredOtp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid verification code.");
        setIsLoading(false);
        return;
      }

      setResetToken(data.resetToken);
      setMode("forgot_new_password");
      setIsLoading(false);
    } catch {
      setError("Network error validating code. Please retry.");
      setIsLoading(false);
    }
  };

  // ── 6. Handle Reset Password (Forgot Password Step 3) ──────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      setError("New master password is required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify and retype.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        setIsLoading(false);
        return;
      }

      setMode("forgot_success");
      setIsLoading(false);
    } catch {
      setError("Network error resetting password. Please retry.");
      setIsLoading(false);
    }
  };

  // ── 7. Return to Login ─────────────────────────────────────────────
  const switchMode = (target: AuthMode) => {
    setError(null);
    setSuccessMsg(null);
    setMode(target);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Luxury Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C8A165]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-[#8B263E]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="w-full max-w-md bg-white border border-[#E5E0D8] rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] p-6 sm:p-8 relative z-10 transition-all duration-300">
        
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B263E] to-[#C8A165] mx-auto flex items-center justify-center shadow-md mb-4">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Internal Concierge Portal
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 mt-1 tracking-tight">
            {mode === "login" && "Admin Login"}
            {mode === "forgot_email" && "Password Recovery"}
            {mode === "forgot_otp" && "Security Verification"}
            {mode === "forgot_new_password" && "Create New Password"}
            {mode === "forgot_success" && "Recovery Complete"}
          </h1>
          <p className="text-xs text-neutral-500 mt-1.5 font-medium leading-relaxed">
            {mode === "login" && "Enter verified administrative credentials to access the YMWA control center."}
            {mode === "forgot_email" && "Enter the registered administrator email to receive a 6-digit security code."}
            {mode === "forgot_otp" && `Enter the 6-digit code dispatched to ${resetEmail}.`}
            {mode === "forgot_new_password" && "Enter and confirm your new master password."}
            {mode === "forgot_success" && "Your master password has been successfully updated."}
          </p>
        </div>

        {/* Global Error Alert */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200/80 flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* Global Success Alert */}
        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-2.5 text-xs text-emerald-800 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMsg}</span>
          </div>
        )}

        {!isMounted ? (
          <div className="space-y-4 animate-pulse" aria-hidden="true">
            <div>
              <div className="h-3.5 w-20 bg-[#E5E0D8]/60 rounded mb-1.5" />
              <div className="h-11 bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl" />
            </div>
            <div>
              <div className="h-3.5 w-28 bg-[#E5E0D8]/60 rounded mb-1.5" />
              <div className="h-11 bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl" />
            </div>
            <div className="flex justify-end pt-0.5">
              <div className="h-3 w-24 bg-[#E5E0D8]/40 rounded" />
            </div>
            <div className="pt-2">
              <div className="h-12 bg-[#8B263E]/80 rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* ────────────────────────────────────────────────────────────────
                VIEW 1: STANDARD ADMIN LOGIN
               ──────────────────────────────────────────────────────────────── */}
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
                {/* Admin Email Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type="email"
                      placeholder="sanjaypatel243444@gmail.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading}
                      autoComplete="email"
                      className="w-full pl-10 pr-4 py-3 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C8A165]/50 focus:border-[#C8A165] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Master Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                      Master Password
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password..."
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading}
                      autoComplete="current-password"
                      className="w-full pl-10 pr-11 py-3 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C8A165]/50 focus:border-[#C8A165] transition-all disabled:opacity-50"
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-0.5">
                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      switchMode("forgot_email");
                    }}
                    className="text-xs font-semibold text-[#8B263E] hover:text-[#C8A165] transition-colors inline-block py-1 touch-manipulation"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Login Button */}
                <div className="pt-2">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#8B263E] hover:bg-[#721f33] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] hover:shadow-[0_6px_20px_rgba(139,38,62,0.4)] transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Access Admin Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ────────────────────────────────────────────────────────────────
                VIEW 2: FORGOT PASSWORD — STEP 1: REQUEST OTP
               ──────────────────────────────────────────────────────────────── */}
            {mode === "forgot_email" && (
              <form onSubmit={handleRequestOtp} className="space-y-4" suppressHydrationWarning>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Registered Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type="email"
                      placeholder="sanjaypatel243444@gmail.com"
                      value={resetEmail}
                      onChange={(e) => {
                        setResetEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading}
                      autoFocus
                      className="w-full pl-10 pr-4 py-3 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C8A165]/50 focus:border-[#C8A165] transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#8B263E] hover:bg-[#721f33] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => switchMode("login")}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Return to Login</span>
                  </button>
                </div>
              </form>
            )}

            {/* ────────────────────────────────────────────────────────────────
                VIEW 3: FORGOT PASSWORD — STEP 2: VERIFY 6-DIGIT OTP
               ──────────────────────────────────────────────────────────────── */}
            {mode === "forgot_otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5" suppressHydrationWarning>
                {/* 6-Digit OTP Box Grid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                      Enter 6-Digit Security Code
                    </label>
                    <span className="text-[11px] font-mono text-[#8B263E] font-semibold">
                      {formatTime(otpExpirySeconds)}
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        suppressHydrationWarning
                        ref={(el) => {
                          otpInputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={handleOtpPaste}
                        disabled={isLoading}
                        className="w-full h-12 text-center text-lg sm:text-xl font-mono font-bold bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#8B263E] focus:border-[#8B263E] transition-all disabled:opacity-50 shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP with Cooldown */}
                <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
                  <span>Didn&apos;t receive the code?</span>
                  {cooldownSeconds > 0 ? (
                    <span className="text-neutral-400 font-mono font-medium">
                      Resend in {cooldownSeconds}s
                    </span>
                  ) : (
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="text-[#8B263E] hover:text-[#721f33] font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Resend Code</span>
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading || otpDigits.join("").length !== 6}
                    className="w-full bg-[#8B263E] hover:bg-[#721f33] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] transition-all active:scale-[0.99] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Proceed</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    suppressHydrationWarning
                    type="button"
                    onClick={() => switchMode("forgot_email")}
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-neutral-500 hover:text-neutral-800 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change Email</span>
                  </button>
                </div>
              </form>
            )}

            {/* ────────────────────────────────────────────────────────────────
                VIEW 4: FORGOT PASSWORD — STEP 3: CREATE NEW PASSWORD
               ──────────────────────────────────────────────────────────────── */}
            {mode === "forgot_new_password" && (
              <form onSubmit={handleResetPassword} className="space-y-4" suppressHydrationWarning>
                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    New Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new master password..."
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading}
                      autoFocus
                      className="w-full pl-10 pr-11 py-3 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C8A165]/50 focus:border-[#C8A165] transition-all disabled:opacity-50"
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      suppressHydrationWarning
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Retype new password..."
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      disabled={isLoading}
                      className="w-full pl-10 pr-11 py-3 text-sm bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#C8A165]/50 focus:border-[#C8A165] transition-all disabled:opacity-50"
                    />
                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#8B263E] hover:bg-[#721f33] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] transition-all active:scale-[0.99] disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Save New Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ────────────────────────────────────────────────────────────────
                VIEW 5: FORGOT PASSWORD — STEP 4: SUCCESS CONFIRMATION
               ──────────────────────────────────────────────────────────────── */}
            {mode === "forgot_success" && (
              <div className="text-center py-4 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>

                <div>
                  <h2 className="font-serif font-bold text-xl text-neutral-900">
                    Password Updated Successfully
                  </h2>
                  <p className="text-xs text-neutral-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Your new master credentials are active. You may now return to the admin portal login screen.
                  </p>
                </div>

                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => {
                    setPassword("");
                    switchMode("login");
                  }}
                  className="w-full bg-[#8B263E] hover:bg-[#721f33] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(139,38,62,0.3)] transition-all active:scale-[0.99]"
                >
                  <span>Return to Admin Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Security Notice */}
        <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-neutral-400 font-medium">
            Protected endpoint. Unauthorized attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
