"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Check } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import OtpInput from "./OtpInput";

interface SignInFormProps {
  onSuccess: (
    mode: "new-user" | "returning-user",
    userName?: string
  ) => void;
  onSwitchToSignup: () => void;
}

type EmailFlowState = "password" | "otp-request" | "otp-verify";

export default function SignInForm({
  onSuccess,
  onSwitchToSignup,
}: SignInFormProps) {
  // -----------------------------------------
  // EMAIL FLOW
  // -----------------------------------------

  const [emailFlow, setEmailFlow] =
    useState<EmailFlowState>("password");

  // -----------------------------------------
  // FORM STATE
  // -----------------------------------------

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  // -----------------------------------------
  // UI STATE
  // -----------------------------------------

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // -----------------------------------------
  // MOUNT STATE
  // -----------------------------------------

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // -----------------------------------------
  // OTP TIMER
  // -----------------------------------------

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((current) => current - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // =========================================================
  // SOCIAL LOGIN
  // =========================================================

  const handleSocialAuth = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Use Supabase OAuth for all social providers.
      // Google prompt=select_account asks Google to show the account chooser,
      // including "Use another account" for entering a different email.
      const options = {
        redirectTo: `${window.location.origin}/login`,
        ...(provider === "google"
          ? { queryParams: { prompt: "select_account" } }
          : {}),
      };

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) throw error;
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(
        err?.message || `${provider} authentication is currently unavailable.`
      );
      setIsLoading(false);
    }
  };

  // =========================================================
  // EMAIL + PASSWORD LOGIN
  // =========================================================

  const handlePasswordLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    try {
      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Login failed. Please try again."
        );
      }

      if (!isMounted.current) return;

      setIsLoading(false);
      setIsSuccess(true);

      const userName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User";

      setTimeout(() => {
        if (isMounted.current) {
          onSuccess("returning-user", userName);
        }
      }, 400);
    } catch (err: any) {
      if (!isMounted.current) return;

      setIsLoading(false);

      setError(
        err?.message ||
          "Invalid email or password."
      );
    }
  };

  // =========================================================
  // SEND PASSWORD RESET EMAIL
  // =========================================================

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();
    setError(null);
    setSuccessMessage(null);

    if (!cleanEmail) {
      setError("Please enter your email address above first.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) throw error;
      if (!isMounted.current) return;
      setSuccessMessage("If an account exists for this email, a password reset link has been sent. Please check your inbox and spam folder.");
    } catch (err: any) {
      if (!isMounted.current) return;
      setError(err?.message || "Could not send the password reset email. Please try again.");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  // =========================================================
  // SEND EMAIL OTP
  // =========================================================

  const handleSendEmailOtp = async (
    e?: React.FormEvent
  ) => {
    e?.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error } =
        await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            shouldCreateUser: false,
          },
        });

      if (error) {
        throw error;
      }

      if (!isMounted.current) return;

      setIsLoading(false);
      setEmailFlow("otp-verify");
      setOtp("");
      setTimer(30);
    } catch (err: any) {
      if (!isMounted.current) return;

      setIsLoading(false);

      setError(
        err?.message ||
          "Could not send OTP."
      );
    }
  };

  // =========================================================
  // VERIFY EMAIL OTP
  // =========================================================

  const handleVerifyEmailOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } =
        await supabase.auth.verifyOtp({
          email: email.trim(),
          token: otp,
          type: "email",
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Verification failed. Please try again."
        );
      }

      if (!isMounted.current) return;

      setIsLoading(false);
      setIsSuccess(true);

      const userName =
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        data.user.email?.split("@")[0] ||
        "User";

      setTimeout(() => {
        if (isMounted.current) {
          onSuccess("returning-user", userName);
        }
      }, 400);
    } catch (err: any) {
      if (!isMounted.current) return;

      setIsLoading(false);

      setError(
        err?.message ||
          "That code isn't correct. Please try again."
      );
    }
  };

  // =========================================================
  // ANIMATION
  // =========================================================

  const fadeVariants = {
    initial: {
      opacity: 0,
      x:
        typeof window !== "undefined" &&
        window.innerWidth < 1024
          ? 0
          : 10,
    },

    animate: {
      opacity: 1,
      x: 0,
    },

    exit: {
      opacity: 0,
      x:
        typeof window !== "undefined" &&
        window.innerWidth < 1024
          ? 0
          : -10,
    },

    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="w-[86%] max-w-[325px] sm:w-full sm:max-w-[395px] md:max-w-[415px] lg:max-w-[425px] xl:max-w-[435px] mx-auto p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#0C0B0A]/90 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col justify-start relative overflow-hidden shrink-0 touch-pan-y"
      style={{
        WebkitBackfaceVisibility: "hidden",
        backfaceVisibility: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >

      {/* ================================================= */}
      {/* ERROR */}
      {/* ================================================= */}

      {error && (
        <div className="mb-4 p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300 text-xs text-center">
          {successMessage}
        </div>
      )}

      <div className="relative">
        <AnimatePresence mode="wait">

          {/* ================================================= */}
          {/* EMAIL FLOW */}
          {/* ================================================= */}

          <motion.div
            key={emailFlow}
            {...fadeVariants}
          >

            {/* ================================================= */}
            {/* PASSWORD LOGIN */}
            {/* ================================================= */}

            {emailFlow === "password" && (
              <motion.div
                key="password"
                {...fadeVariants}
                className="flex flex-col"
              >

                <div className="mb-3 lg:mb-4">
                  <h2 className="font-serif text-[24px] lg:text-[28px] text-[#FDFBF7] font-semibold mb-0.5">
                    SIGN IN
                  </h2>

                  <p className="text-xs lg:text-sm text-[#FDFBF7]/70">
                    Welcome back.
                  </p>
                </div>

                <form
                  onSubmit={handlePasswordLogin}
                  className="flex flex-col gap-2.5 lg:gap-3"
                >

                  {/* EMAIL */}

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#FDFBF7]/50" />
                    </div>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      required
                      placeholder="Email Address"
                      className="w-full h-[46px] lg:h-[48px] pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs lg:text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30"
                    />
                  </div>

                  {/* PASSWORD */}

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-[#FDFBF7]/50" />
                    </div>

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      required
                      placeholder="Password"
                      className="w-full h-[46px] lg:h-[48px] pl-10 pr-11 bg-white/5 border border-white/10 rounded-xl text-xs lg:text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#FDFBF7]/50 hover:text-[#FDFBF7]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {/* REMEMBER + FORGOT */}

                  <div className="flex items-center justify-between mt-0.5 mb-0.5 px-0.5">

                    <label className="flex items-center gap-1.5 cursor-pointer group">

                      <div className="w-3.5 h-3.5 rounded border border-white/20 flex items-center justify-center group-hover:border-[#C6934A]/50 transition-colors bg-white/5">
                        <Check
                          className={`h-2.5 w-2.5 text-[#C6934A] ${
                            rememberMe
                              ? "opacity-100"
                              : "opacity-0"
                          }`}
                        />
                      </div>

                      <input
                        type="checkbox"
                        className="hidden"
                        checked={rememberMe}
                        onChange={() =>
                          setRememberMe(!rememberMe)
                        }
                      />

                      <span className="text-[11px] lg:text-xs text-[#FDFBF7]/70">
                        Remember me
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={isLoading}
                      className="text-[11px] lg:text-xs text-[#FDFBF7]/60 hover:text-[#FDFBF7] disabled:opacity-50"
                    >
                      {isLoading ? "SENDING RESET LINK..." : "Forgot Password?"}
                    </button>
                  </div>

                  {/* LOGIN BUTTON */}

                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="w-full h-[46px] lg:h-[48px] mt-1 bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-xs lg:text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                  >
                    {isSuccess
                      ? "SIGN IN SUCCESS ✓"
                      : isLoading
                      ? "LOGGING IN..."
                      : "LOG IN →"}
                  </button>

                  {/* EMAIL OTP */}

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setIsSuccess(false);
                      setEmailFlow("otp-request");
                    }}
                    className="text-[11px] lg:text-xs text-[#FDFBF7]/50 hover:text-[#FDFBF7] transition-colors mt-1"
                  >
                    Use email OTP instead
                  </button>

                </form>
              </motion.div>
            )}

            {/* ================================================= */}
            {/* EMAIL OTP REQUEST */}
            {/* ================================================= */}

            {emailFlow === "otp-request" && (
              <motion.div
                key="otp-request"
                {...fadeVariants}
                className="flex flex-col"
              >

                <div className="mb-4">
                  <h2 className="font-serif text-[24px] lg:text-[28px] text-[#FDFBF7] font-semibold mb-0.5">
                    VERIFY WITH EMAIL
                  </h2>

                  <p className="text-xs lg:text-sm text-[#FDFBF7]/70">
                    Enter your email address
                  </p>
                </div>

                <form
                  onSubmit={handleSendEmailOtp}
                  className="flex flex-col gap-2.5 lg:gap-3"
                >

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-[#FDFBF7]/50" />
                    </div>

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                        setSuccessMessage(null);
                      }}
                      required
                      placeholder="Email Address"
                      className="w-full h-[46px] lg:h-[48px] pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-xs lg:text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-[46px] lg:h-[48px] mt-2 bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-xs lg:text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                  >
                    {isLoading
                      ? "SENDING..."
                      : "SEND OTP →"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setEmailFlow("password");
                    }}
                    className="text-[11px] lg:text-xs text-[#FDFBF7]/50 hover:text-[#FDFBF7] transition-colors mt-1"
                  >
                    Sign in with password
                  </button>

                </form>
              </motion.div>
            )}

            {/* ================================================= */}
            {/* EMAIL OTP VERIFY */}
            {/* ================================================= */}

            {emailFlow === "otp-verify" && (
              <motion.div
                key="otp-verify"
                {...fadeVariants}
                className="flex flex-col"
              >

                <div className="mb-4">
                  <h2 className="font-serif text-[22px] lg:text-[26px] text-[#FDFBF7] font-semibold mb-0.5">
                    VERIFY YOUR EMAIL
                  </h2>

                  <p className="text-xs lg:text-sm text-[#FDFBF7]/70 leading-relaxed">
                    We've sent a verification code to:
                    <br />

                    <span className="text-white font-medium">
                      {email}
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">

                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    disabled={
                      isLoading ||
                      otp.length < 6 ||
                      isSuccess
                    }
                    className="w-full h-[46px] lg:h-[48px] bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-xs lg:text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                  >
                    {isSuccess
                      ? "SIGN IN SUCCESS ✓"
                      : isLoading
                      ? "VERIFYING..."
                      : "VERIFY & CONTINUE →"}
                  </button>

                  <div className="flex flex-col items-center gap-1.5 mt-0.5">

                    <button
                      type="button"
                      onClick={() =>
                        handleSendEmailOtp()
                      }
                      disabled={
                        timer > 0 || isLoading
                      }
                      className="text-[11px] lg:text-xs text-[#FDFBF7]/70 hover:text-[#FDFBF7] transition-colors disabled:opacity-50"
                    >
                      {timer > 0
                        ? `Resend code in ${timer}s`
                        : "Resend code"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEmailFlow("otp-request");
                        setOtp("");
                        setTimer(0);
                        setError(null);
                      }}
                      className="text-[11px] lg:text-xs text-[#C6934A] hover:text-[#E2B777] transition-colors"
                    >
                      Change email
                    </button>

                  </div>
                </div>
              </motion.div>
            )}

          </motion.div>

        </AnimatePresence>
      </div>

      {/* ================================================= */}
      {/* SOCIAL LOGIN */}
      {/* ================================================= */}

      {emailFlow !== "otp-verify" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-2.5 lg:mt-3"
        >

          <div className="relative flex items-center justify-center mb-2.5 lg:mb-3">

            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>

            <div className="relative bg-[#0C0B0A] px-3 text-[9px] lg:text-[10px] tracking-[0.2em] text-[#FDFBF7]/50 uppercase">
              OR CONTINUE WITH
            </div>

          </div>

          <div className="flex items-center justify-center gap-2.5 lg:gap-3">

            {/* ================================================= */}
            {/* GOOGLE */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleSocialAuth("google")
              }
              disabled={isLoading}
              aria-label="Continue with Google"
              className="w-13 h-10 lg:w-14 lg:h-11 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />

                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />

                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />

                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            </button>

            {/* ================================================= */}
            {/* FACEBOOK */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleSocialAuth("facebook")
              }
              disabled={isLoading}
              aria-label="Continue with Facebook"
              className="w-13 h-10 lg:w-14 lg:h-11 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                  fill="#1877F2"
                />
              </svg>
            </button>

            {/* ================================================= */}
            {/* APPLE */}
            {/* ================================================= */}

            <button
              type="button"
              onClick={() =>
                handleSocialAuth("apple")
              }
              disabled={isLoading}
              aria-label="Continue with Apple"
              className="w-13 h-10 lg:w-14 lg:h-11 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center text-white disabled:opacity-50"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M17.05 13.31c-.02-2.58 2.11-3.83 2.2-3.88-1.2-1.75-3.06-1.99-3.73-2.02-1.57-.16-3.07.92-3.88.92-.8 0-2.04-.9-3.34-.88-1.7.02-3.26.99-4.14 2.52-1.79 3.1-.46 7.69 1.28 10.2 .85 1.23 1.86 2.61 3.19 2.56 1.28-.05 1.78-.82 3.32-.82 1.54 0 2.01.82 3.35.79 1.37-.03 2.23-1.24 3.08-2.48.98-1.43 1.39-2.82 1.41-2.9-.03-.01-2.7-1.04-2.74-4.01zM15.02 5.06c.71-.85 1.18-2.04 1.05-3.22-1.02.04-2.25.68-2.98 1.54-.58.68-1.15 1.89-1 3.06 1.14.09 2.22-.53 2.93-1.38z" />
              </svg>
            </button>

          </div>

          {/* ================================================= */}
          {/* CREATE ACCOUNT */}
          {/* ================================================= */}

          <div className="mt-2.5 lg:mt-3 text-center">

            <span className="text-[11px] lg:text-xs text-[#FDFBF7]/50">
              Don&apos;t have an account?{" "}
            </span>

            <button
              onClick={onSwitchToSignup}
              type="button"
              className="text-[11px] lg:text-xs text-[#C6934A] font-medium hover:text-[#E2B777] transition-colors py-0.5 px-1.5"
            >
              Create account
            </button>

          </div>

        </motion.div>
      )}

    </div>
  );
}