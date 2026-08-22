"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Phone, ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import OtpInput from "./OtpInput";

interface SignInFormProps {
  onSuccess: (mode: "new-user" | "returning-user", userName?: string) => void;
  onSwitchToSignup: () => void;
}

type AuthMethod = "email" | "mobile";
type EmailFlowState = "password" | "otp-request" | "otp-verify";
type MobileFlowState = "request" | "verify";

export default function SignInForm({ onSuccess, onSwitchToSignup }: SignInFormProps) {
  const [method, setMethod] = useState<AuthMethod>("email");
  const [emailFlow, setEmailFlow] = useState<EmailFlowState>("password");
  const [mobileFlow, setMobileFlow] = useState<MobileFlowState>("request");

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = React.useRef(true);
  React.useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);
  
  // Timer State
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handlers
  const handleSocialAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setError(null);
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      const error = null;
      if (error) throw error;
      onSuccess("returning-user");
    } catch (err: any) {
      setError(`${provider} authentication is currently unavailable.`);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!isMounted.current) return;
      const err = null;
      if (err) throw err;
      setIsSuccess(true);
      setTimeout(() => {
        if (isMounted.current) onSuccess("returning-user", email.split('@')[0]);
      }, 400);
    } catch (err: any) {
      if (!isMounted.current) return;
      // In development fallback, just simulate success if auth is totally broken
      if (err.message?.includes("fetch")) {
        setIsSuccess(true);
        setTimeout(() => {
          if (isMounted.current) onSuccess("returning-user", email.split('@')[0]);
        }, 400);
      } else {
        setError(err.message || "Invalid login credentials.");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      const error = null;
      if (error) throw error;
      setEmailFlow("otp-verify");
      setTimer(30);
    } catch (err: any) {
      if (err.message.includes("fetch")) {
        // Fallback simulate
        setEmailFlow("otp-verify");
        setTimer(30);
      } else {
        setError(err.message || "Could not send OTP.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    setError(null);
    try {
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      const error = null;
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => onSuccess("returning-user", email.split('@')[0]), 400);
    } catch (err: any) {
      if (err.message?.includes("fetch")) {
        setIsSuccess(true);
        setTimeout(() => onSuccess("returning-user", email.split('@')[0]), 400);
      } else {
        setError("That code isn't correct. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Basic formatting, assuming +91 is added if not present
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      const error = null;
      if (error) throw error;
      setMobileFlow("verify");
      setTimer(30);
    } catch (err: any) {
      if (err.message.includes("fetch")) {
        setMobileFlow("verify");
        setTimer(30);
      } else {
        setError("Mobile verification is currently unavailable. Please use email.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (otp.length < 6) return;
    setIsLoading(true);
    setError(null);
    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      // MOCKED FOR UI TESTING
      await new Promise(resolve => setTimeout(resolve, 1000));
      const error = null;
      if (error) throw error;
      setIsSuccess(true);
      setTimeout(() => onSuccess("returning-user"), 400);
    } catch (err: any) {
      if (err.message?.includes("fetch")) {
        setIsSuccess(true);
        setTimeout(() => onSuccess("returning-user"), 400);
      } else {
        setError("That code isn't correct. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Animation Variants
  const fadeVariants = {
    initial: { opacity: 0, x: 10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -10 },
    transition: { duration: 0.4, ease: "easeInOut" }
  };

  return (
    <div className="w-full max-w-[380px] mx-auto p-5 lg:p-6 rounded-2xl bg-[#0C0B0A]/90 backdrop-blur-md border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col justify-start relative overflow-hidden">
      
      {/* METHOD SWITCHER (Only show if not in verify states) */}
      {emailFlow !== "otp-verify" && mobileFlow !== "verify" && (
        <div className="flex bg-[#1a1a1a]/50 p-1 rounded-lg mb-4 border border-white/5">
          <button 
            onClick={() => { setMethod("email"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ease-out ${method === "email" ? "bg-[#1a1a1a] text-[#C6934A] border border-[#C6934A]/30 shadow-sm" : "text-[#FDFBF7]/50 hover:text-[#FDFBF7]"}`}
          >
            Email
          </button>
          <button 
            onClick={() => { setMethod("mobile"); setError(null); }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-300 ease-out ${method === "mobile" ? "bg-[#1a1a1a] text-[#C6934A] border border-[#C6934A]/30 shadow-sm" : "text-[#FDFBF7]/50 hover:text-[#FDFBF7]"}`}
          >
            Mobile
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      <div className="relative">
        <AnimatePresence mode="wait">
          
          {/* EMAIL METHOD */}
          {method === "email" && (
            <motion.div key="email-flow" {...fadeVariants}>
              
              {/* Email Password State */}
              {emailFlow === "password" && (
                <motion.div key="password" {...fadeVariants} className="flex flex-col">
                  <div className="mb-4">
                    <h2 className="font-serif text-[28px] text-[#FDFBF7] font-semibold mb-1">SIGN IN</h2>
                    <p className="text-[14px] lg:text-[15px] text-[#FDFBF7]/70">Welcome back.</p>
                  </div>
                  <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-[#FDFBF7]/50" /></div>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email Address" className="w-full h-[50px] pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#0C0B0A_inset_!important] [&:-webkit-autofill]:[-webkit-text-fill-color:#FDFBF7_!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s_!important]" />
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-[#FDFBF7]/50" /></div>
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Password" className="w-full h-[50px] pl-11 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#0C0B0A_inset_!important] [&:-webkit-autofill]:[-webkit-text-fill-color:#FDFBF7_!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s_!important]" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#FDFBF7]/50 hover:text-[#FDFBF7] transition-colors">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>
                    <div className="flex items-center justify-between mt-1 mb-1 px-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center group-hover:border-[#C6934A]/50 transition-colors bg-white/5">
                          <Check className={`h-3 w-3 text-[#C6934A] ${rememberMe ? 'opacity-100' : 'opacity-0'}`} />
                        </div>
                        <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                        <span className="text-xs text-[#FDFBF7]/70">Remember me</span>
                      </label>
                      <button type="button" className="text-xs text-[#FDFBF7]/60 hover:text-[#FDFBF7] transition-colors">Forgot Password?</button>
                    </div>
                    <button type="submit" disabled={isLoading || isSuccess} className="w-full h-[50px] mt-2 bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">
                      {isSuccess ? "SIGN IN SUCCESS ✓" : isLoading ? "LOGGING IN..." : "LOG IN →"}
                    </button>
                    <button type="button" onClick={() => setEmailFlow("otp-request")} className="text-xs text-[#FDFBF7]/50 hover:text-[#FDFBF7] transition-colors mt-2">Use email OTP instead</button>
                  </form>
                </motion.div>
              )}

              {/* Email OTP Request State */}
              {emailFlow === "otp-request" && (
                <motion.div key="otp-req" {...fadeVariants} className="flex flex-col">
                  <div className="mb-5">
                    <h2 className="font-serif text-[28px] text-[#FDFBF7] font-semibold mb-1">VERIFY WITH EMAIL</h2>
                    <p className="text-[14px] lg:text-[15px] text-[#FDFBF7]/70">Enter your email address</p>
                  </div>
                  <form onSubmit={handleSendEmailOtp} className="flex flex-col gap-3">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-[#FDFBF7]/50" /></div>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email Address" className="w-full h-[50px] pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#0C0B0A_inset_!important] [&:-webkit-autofill]:[-webkit-text-fill-color:#FDFBF7_!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s_!important]" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full h-[50px] mt-3 bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">{isLoading ? "SENDING..." : "SEND OTP →"}</button>
                    <button type="button" onClick={() => setEmailFlow("password")} className="text-xs text-[#FDFBF7]/50 hover:text-[#FDFBF7] transition-colors mt-2">Sign in with password</button>
                  </form>
                </motion.div>
              )}

              {/* Email OTP Verify State */}
              {emailFlow === "otp-verify" && (
                <motion.div key="otp-ver" {...fadeVariants} className="flex flex-col">
                  <div className="mb-5">
                    <h2 className="font-serif text-[26px] text-[#FDFBF7] font-semibold mb-1">VERIFY YOUR EMAIL</h2>
                    <p className="text-sm text-[#FDFBF7]/70 leading-relaxed">We've sent a verification code to:<br/><span className="text-white font-medium">{email}</span></p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
                    <button onClick={handleVerifyEmailOtp} disabled={isLoading || otp.length < 6 || isSuccess} className="w-full h-[52px] bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">
                      {isSuccess ? "SIGN IN SUCCESS ✓" : isLoading ? "VERIFYING..." : "VERIFY & CONTINUE →"}
                    </button>
                    <div className="flex flex-col items-center gap-2 mt-1">
                      <button onClick={handleSendEmailOtp} disabled={timer > 0 || isLoading} className="text-xs text-[#FDFBF7]/70 hover:text-[#FDFBF7] transition-colors disabled:opacity-50">{timer > 0 ? `Resend code in ${timer}s` : "Resend code"}</button>
                      <button onClick={() => { setEmailFlow("otp-request"); setOtp(""); setTimer(0); }} className="text-xs text-[#C6934A] hover:text-[#E2B777] transition-colors">Change email</button>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

          {/* MOBILE METHOD */}
          {method === "mobile" && (
            <motion.div key="mobile-flow" {...fadeVariants}>
              
              {/* Mobile OTP Request State */}
              {mobileFlow === "request" && (
                <motion.div key="mob-req" {...fadeVariants} className="flex flex-col">
                  <div className="mb-5">
                    <h2 className="font-serif text-[28px] text-[#FDFBF7] font-semibold mb-1">SIGN IN WITH MOBILE</h2>
                    <p className="text-[14px] lg:text-[15px] text-[#FDFBF7]/70">Enter your phone number</p>
                  </div>
                  <form onSubmit={handleSendMobileOtp} className="flex flex-col gap-3">
                    <div className="relative flex">
                      <div className="w-16 h-[50px] bg-white/5 border border-white/10 border-r-0 rounded-l-xl flex items-center justify-center text-sm text-[#FDFBF7]/70">+91</div>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} required placeholder="Enter mobile number" className="w-full h-[50px] pl-4 pr-4 bg-white/5 border border-white/10 border-l-0 rounded-r-xl text-sm text-[#FDFBF7] focus:outline-none focus:border-[#C6934A]/50 focus:bg-white/10 transition-colors placeholder-[#FDFBF7]/30 [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#0C0B0A_inset_!important] [&:-webkit-autofill]:[-webkit-text-fill-color:#FDFBF7_!important] [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s_!important]" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full h-[50px] mt-3 bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">{isLoading ? "SENDING..." : "SEND OTP →"}</button>
                  </form>
                </motion.div>
              )}

              {/* Mobile OTP Verify State */}
              {mobileFlow === "verify" && (
                <motion.div key="mob-ver" {...fadeVariants} className="flex flex-col">
                  <div className="mb-5">
                    <h2 className="font-serif text-[26px] text-[#FDFBF7] font-semibold mb-1">VERIFY YOUR NUMBER</h2>
                    <p className="text-sm text-[#FDFBF7]/70 leading-relaxed">We've sent a verification code to:<br/><span className="text-white font-medium">+91 {phone}</span></p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <OtpInput value={otp} onChange={setOtp} disabled={isLoading} />
                    <button onClick={handleVerifyMobileOtp} disabled={isLoading || otp.length < 6 || isSuccess} className="w-full h-[52px] bg-[#C6934A] hover:bg-[#B3833E] text-[#111111] text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">
                      {isSuccess ? "SIGN IN SUCCESS ✓" : isLoading ? "VERIFYING..." : "VERIFY & CONTINUE →"}
                    </button>
                    <div className="flex flex-col items-center gap-2 mt-1">
                      <button onClick={handleSendMobileOtp} disabled={timer > 0 || isLoading} className="text-xs text-[#FDFBF7]/70 hover:text-[#FDFBF7] transition-colors disabled:opacity-50">{timer > 0 ? `Resend code in ${timer}s` : "Resend code"}</button>
                      <button onClick={() => { setMobileFlow("request"); setOtp(""); setTimer(0); }} className="text-xs text-[#C6934A] hover:text-[#E2B777] transition-colors">Change number</button>
                    </div>
                  </div>
                </motion.div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Social Auth & Registration (Hidden during OTP Verification) */}
      {emailFlow !== "otp-verify" && mobileFlow !== "verify" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-3">
          <div className="relative flex items-center justify-center mb-3">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <div className="relative bg-[#0C0B0A] px-4 text-[10px] tracking-[0.2em] text-[#FDFBF7]/50 uppercase">
              OR CONTINUE WITH
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3">
            <button onClick={() => handleSocialAuth('google')} className="w-14 h-12 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            </button>
            <button onClick={() => handleSocialAuth('facebook')} className="w-14 h-12 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2"/></svg>
            </button>
            <button onClick={() => handleSocialAuth('apple')} className="w-14 h-12 bg-[#1A1A1A] hover:bg-[#252525] border border-white/5 rounded-lg flex items-center justify-center transition-colors text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 13.31c-.02-2.58 2.11-3.83 2.2-3.88-1.2-1.75-3.06-1.99-3.73-2.02-1.57-.16-3.07.92-3.88.92-.8 0-2.04-.9-3.34-.88-1.7.02-3.26.99-4.14 2.52-1.79 3.1-.46 7.69 1.28 10.2 .85 1.23 1.86 2.61 3.19 2.56 1.28-.05 1.78-.82 3.32-.82 1.54 0 2.01.82 3.35.79 1.37-.03 2.23-1.24 3.08-2.48.98-1.43 1.39-2.82 1.41-2.9-.03-.01-2.7-1.04-2.74-4.01zM15.02 5.06c.71-.85 1.18-2.04 1.05-3.22-1.02.04-2.25.68-2.98 1.54-.58.68-1.15 1.89-1 3.06 1.14.09 2.22-.53 2.93-1.38z"/></svg>
            </button>
          </div>
          
          <div className="mt-3 text-center">
            <span className="text-xs text-[#FDFBF7]/50">Don&apos;t have an account? </span>
            <button onClick={onSwitchToSignup} type="button" className="text-xs text-[#C6934A] font-medium hover:text-[#E2B777] transition-colors py-1 px-2">Create account</button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
