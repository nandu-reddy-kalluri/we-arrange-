"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import SignInForm from "@/components/auth/SignInForm";
import CreateAccountForm from "@/components/auth/CreateAccountForm";
import CinematicPortal from "@/components/auth/CinematicPortal";
import Navbar from "@/components/layout/Navbar";

type AuthState = "idle" | "cinematic" | "redirecting";

function AuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Track auth mode based on URL query param
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [authMode, setAuthMode] = useState<"signin" | "signup">(initialMode);
  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("idle");
  const [authData, setAuthData] = useState<{mode: "new-user" | "returning-user", userName?: string}>({mode: "returning-user"});
  const [authVisible, setAuthVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
    if (currentMode !== authMode) {
      setAuthMode(currentMode);
    }
  }, [searchParams, authMode]);

  const handleModeSwitch = (newMode: "signin" | "signup") => {
    setAuthMode(newMode);
    // Update URL without full reload
    const url = newMode === "signup" ? "/login?mode=signup" : "/login";
    window.history.pushState(null, "", url);
  };

  const handleAuthSuccess = (mode: "new-user" | "returning-user", userName?: string) => {
    setAuthData({ mode, userName });
    setAuthState("cinematic");
  };

  const fadeVariants = {
    initial: { opacity: 0, x: authMode === 'signup' ? 12 : -12 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: authMode === 'signup' ? -12 : 12 },
    transition: { duration: 0.5, ease: "easeInOut" }
  };

  if (!mounted) return null; // Prevent hydration mismatch with searchParams

  return (
    <div className="relative min-h-[100svh] w-full bg-[#111] font-sans overflow-x-hidden flex flex-col">
      
      <AnimatePresence>
        {authState === "cinematic" && (
          <CinematicPortal 
            mode={authData.mode} 
            userName={authData.userName} 
            onShuttersClosed={() => setAuthVisible(false)}
            onComplete={() => {
              setAuthState("redirecting");
              router.push("/");
            }} 
          />
        )}
      </AnimatePresence>

      {authVisible && (
        <>
          {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/images/register/mandap_hero.png"
          alt="Luxury Wedding Venue"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        {/* Layered overlay: subtle base */}
        <div className="absolute inset-0 bg-black/30 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-black/60 z-[2]" />
      </div>

      {/* ── NAVBAR OVERLAY ── */}
      <div className="relative z-50">
        <Navbar />
      </div>

      {/* ── CONTENT WRAPPER ── */}
      <main className="relative z-10 w-full max-w-[1536px] mx-auto min-h-[100svh] pt-[70px] md:pt-[80px] pb-8 lg:pb-0 px-4 md:px-12 xl:px-16 flex flex-col lg:grid lg:grid-cols-[56%_44%] items-center justify-center gap-6 lg:gap-16 xl:gap-20">
        
        {/* ── LEFT: MARKETING & HERO (Desktop Only to prevent mobile crowding) ── */}
        <div className="hidden lg:flex w-full text-white pt-6 lg:pt-0 justify-start lg:justify-center">
          <div className="w-full max-w-[500px] lg:max-w-[620px]">
            <h1 className="text-[40px] lg:text-[52px] xl:text-[54px] font-serif font-medium leading-[1.05] mb-5">
              Find the Perfect<br className="hidden lg:block" />
              <span className="lg:hidden"> </span>Venue for Every Moment.
            </h1>
            
            <p className="text-base lg:text-[17px] text-white/80 leading-[1.6] mb-7 font-light max-w-[480px]">
              Discover verified wedding venues, trusted vendors, and everything you need to celebrate beautifully.
            </p>

            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] lg:text-xs font-semibold tracking-widest text-[#C6934A] uppercase mt-7">
              <span>Verified Venues</span>
              <span className="text-white/50">·</span>
              <span>Trusted Vendors</span>
              <span className="text-white/50">·</span>
              <span>Easy Booking</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: AUTHENTICATION PANEL ── */}
        <div className="w-full flex justify-center lg:justify-start xl:justify-center relative">
          <AnimatePresence mode="wait">
            {authMode === "signin" ? (
              <motion.div key="signin" {...fadeVariants}>
                <SignInForm 
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignup={() => handleModeSwitch("signup")}
                />
              </motion.div>
            ) : (
              <motion.div key="signup" {...fadeVariants}>
                <CreateAccountForm 
                  onSuccess={handleAuthSuccess}
                  onSwitchToSignin={() => handleModeSwitch("signin")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          </main>
        </>
      )}
    </div>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#111]">
        <div className="w-8 h-8 border-2 border-[#C6934A] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthenticationContent />
    </Suspense>
  );
}
