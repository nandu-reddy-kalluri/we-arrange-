"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowRight, AlertTriangle, WifiOff, Clock } from "lucide-react";
import { loginSchema, LoginFormData } from "../../lib/validation";
import GlassCard from "./GlassCard";
import AnimatedInput from "./AnimatedInput";
import PasswordInput from "./PasswordInput";
import AnimatedCheckbox from "./AnimatedCheckbox";
import AnimatedButton from "./AnimatedButton";
import Divider from "./Divider";
import SocialLoginButtons from "./SocialLoginButtons";

interface LoginCardProps {
  onSuccess?: () => void;
  onLoadingStart?: () => void;
  onLoadingEnd?: () => void;
}

export const LoginCard: React.FC<LoginCardProps> = ({
  onSuccess,
  onLoadingStart,
  onLoadingEnd,
}) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeAlert, setActiveAlert] = useState<
    "none" | "invalid_creds" | "offline" | "session_expired"
  >("none");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    if (onLoadingStart) onLoadingStart();

    try {
      // Simulate authenticating against API backend
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // Demo check for specific error testing inputs
      if (data.email === "error@test.com") {
        setServerError("Invalid email address or password. Please try again.");
        if (onLoadingEnd) onLoadingEnd();
        return;
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError("An unexpected server error occurred. Please try again later.");
      if (onLoadingEnd) onLoadingEnd();
    }
  };

  // Helper trigger for interactive alert simulation
  const handleAlertSimulate = (type: "invalid_creds" | "offline" | "session_expired") => {
    if (activeAlert === type) {
      setActiveAlert("none");
      setServerError(null);
    } else {
      setActiveAlert(type);
      if (type === "invalid_creds") setServerError("Incorrect credentials. Please verify email and password.");
      if (type === "offline") setServerError("You appear to be offline. Check your network connection.");
      if (type === "session_expired") setServerError("Your security session expired. Please sign in again.");
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto relative z-20">
      {/* Top Welcome Title */}
      <div className="text-left space-y-2 mb-6">
        <div className="inline-block px-3 py-1 rounded-full bg-[#8B263E]/10 border border-[#C5A880]/40 text-[11px] font-semibold tracking-wider text-[#8B263E] dark:text-[#C5A880] uppercase">
          Member Sign In
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2D2D] dark:text-[#FFFFFF] tracking-tight">
          Welcome to Your <span className="text-[#8B263E] dark:text-[#C5A880]">Portal</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#6D6D6D] dark:text-[#A19890]">
          Enter your credentials to access your luxury wedding concierge dashboard.
        </p>
      </div>

      {/* Simulated System Alert Banners for testing error states */}
      <AnimatePresence>
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <span className="font-semibold block mb-0.5">Authentication Failure</span>
              <span>{serverError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Element */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email Field */}
        <AnimatedInput
          id="email"
          label="Email Address"
          type="email"
          autoComplete="email"
          icon={<Mail className="w-4 h-4" />}
          register={register("email")}
          error={errors.email}
        />

        {/* Password Field */}
        <PasswordInput
          id="password"
          label="Password"
          autoComplete="current-password"
          register={register("password")}
          error={errors.password}
        />

        {/* Remember Me & Forgot Password Row */}
        <div className="flex items-center justify-between pt-1 pb-1">
          <AnimatedCheckbox
            id="rememberMe"
            label="Remember me"
            checked={rememberMe}
            onChange={(checked) => setValue("rememberMe", checked)}
          />

          <a
            href="#forgot-password"
            onClick={(e) => {
              e.preventDefault();
              alert("A password reset link will be sent to your registered email.");
            }}
            className="text-xs font-medium text-[#8B263E] dark:text-[#C5A880] hover:underline underline-offset-4 transition-all duration-200"
          >
            Forgot password?
          </a>
        </div>

        {/* Sign In Primary Button */}
        <AnimatedButton
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          icon={<ArrowRight className="w-4 h-4" />}
        >
          Sign In to Portal
        </AnimatedButton>
      </form>

      {/* Divider */}
      <Divider text="OR" />

      {/* Social Login Options */}
      <SocialLoginButtons
        onGoogleLogin={() => onSubmit({ email: "google@user.com", password: "Password123!", rememberMe: true })}
        onAppleLogin={() => onSubmit({ email: "apple@user.com", password: "Password123!", rememberMe: true })}
        onPhoneLogin={() => alert("OTP Verification requested for Phone Login.")}
        onGuestLogin={() => onSubmit({ email: "guest@youmarriagewearrange.com", password: "GuestPassword123!", rememberMe: false })}
      />

      {/* Sign Up Footer Link */}
      <div className="mt-6 text-center pt-3 border-t border-[#C5A880]/20">
        <p className="text-xs text-[#6D6D6D] dark:text-[#A19890]">
          Don't have an account?{" "}
          <a
            href="#signup"
            onClick={(e) => {
              e.preventDefault();
              alert("Redirecting to YouMarriageWeArrange Concierge Registration.");
            }}
            className="font-semibold text-[#8B263E] dark:text-[#C5A880] hover:underline underline-offset-4"
          >
            Begin Your Journey
          </a>
        </p>
      </div>

      {/* Interactive Error State Toggle Bar for Testing/Validation */}
      <div className="mt-5 pt-3 border-t border-dashed border-[#C5A880]/20 flex items-center justify-center gap-2 text-[10px] text-[#6D6D6D] dark:text-[#A19890]">
        <span>Test State:</span>
        <button
          type="button"
          onClick={() => handleAlertSimulate("invalid_creds")}
          className={`px-2 py-0.5 rounded-full border ${
            activeAlert === "invalid_creds"
              ? "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300"
              : "border-gray-300 dark:border-zinc-700"
          }`}
        >
          Invalid Creds
        </button>
        <button
          type="button"
          onClick={() => handleAlertSimulate("offline")}
          className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            activeAlert === "offline"
              ? "bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300"
              : "border-gray-300 dark:border-zinc-700"
          }`}
        >
          <WifiOff className="w-2.5 h-2.5" /> Offline
        </button>
        <button
          type="button"
          onClick={() => handleAlertSimulate("session_expired")}
          className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            activeAlert === "session_expired"
              ? "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300"
              : "border-gray-300 dark:border-zinc-700"
          }`}
        >
          <Clock className="w-2.5 h-2.5" /> Expired
        </button>
      </div>
    </GlassCard>
  );
};

export default LoginCard;
