"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import SignInForm from "@/components/auth/SignInForm";
import CreateAccountForm from "@/components/auth/CreateAccountForm";
import CinematicPortal from "@/components/auth/CinematicPortal";
import Navbar from "@/components/layout/Navbar/index";

import { supabase } from "@/services/supabase/client";

type AuthState = "idle" | "cinematic" | "redirecting";

function AuthenticationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode =
    searchParams.get("mode") === "signup" ? "signup" : "signin";

  const [authMode, setAuthMode] = useState<"signin" | "signup">(
    initialMode
  );

  const [mounted, setMounted] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("idle");

  const [authData, setAuthData] = useState<{
    mode: "new-user" | "returning-user";
    userName?: string;
  }>({
    mode: "returning-user",
  });

  const [authVisible, setAuthVisible] = useState(true);

  // --------------------------------------------------
  // MOUNT + MOBILE SCROLL LOCK
  // --------------------------------------------------

  useEffect(() => {
    setMounted(true);

    const lockScrollOnMobile = () => {
      if (
        typeof window !== "undefined" &&
        window.innerWidth < 1024
      ) {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        document.body.style.touchAction = "none";
      } else {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
        document.body.style.touchAction = "";
      }
    };

    lockScrollOnMobile();

    window.addEventListener("resize", lockScrollOnMobile);

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.body.style.touchAction = "";

      window.removeEventListener(
        "resize",
        lockScrollOnMobile
      );
    };
  }, []);

  // --------------------------------------------------
  // SYNC AUTH MODE WITH URL
  // --------------------------------------------------

  useEffect(() => {
    const currentMode =
      searchParams.get("mode") === "signup"
        ? "signup"
        : "signin";

    if (currentMode !== authMode) {
      setAuthMode(currentMode);
    }
  }, [searchParams, authMode]);

  // --------------------------------------------------
  // GOOGLE OAUTH CALLBACK
  // --------------------------------------------------

  useEffect(() => {
    if (!mounted) return;

    const handleOAuthCallback = async () => {
      try {
        const params = new URLSearchParams(
          window.location.search
        );

        const code = params.get("code");

        // Normal /login visit
        if (!code) {
          return;
        }

        console.log("OAUTH CODE FOUND");

        // Exchange OAuth code for Supabase session
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error(
            "OAUTH CODE EXCHANGE ERROR:",
            exchangeError
          );
          return;
        }

        console.log("OAUTH SESSION CREATED");

        // Remove OAuth code from URL
        window.history.replaceState(
          {},
          document.title,
          "/login"
        );

        // Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          console.error(
            "OAUTH USER ERROR:",
            userError
          );
          return;
        }

        if (!user) {
          console.error("OAUTH USER NOT FOUND");
          return;
        }

        const userName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        console.log(
          "OAUTH USER LOGGED IN:",
          user.id
        );

        console.log(
          "OAUTH USER NAME:",
          userName
        );

        setAuthData({
          mode: "returning-user",
          userName,
        });

        setAuthState("cinematic");
      } catch (error) {
        console.error(
          "OAUTH CALLBACK ERROR:",
          error
        );
      }
    };

    handleOAuthCallback();
  }, [mounted]);

  // --------------------------------------------------
  // AUTH MODE SWITCH
  // --------------------------------------------------

  const handleModeSwitch = (
    newMode: "signin" | "signup"
  ) => {
    setAuthMode(newMode);

    const url =
      newMode === "signup"
        ? "/login?mode=signup"
        : "/login";

    window.history.pushState(null, "", url);
  };

  // --------------------------------------------------
  // NORMAL LOGIN / SIGNUP SUCCESS
  // --------------------------------------------------
const handleAuthSuccess = (
  mode: "new-user" | "returning-user",
  userName?: string
) => {
  console.log("AUTH SUCCESS");
  console.log("AUTH MODE:", mode);
  console.log("AUTH USER:", userName);

  setAuthData({
    mode,
    userName,
  });

  setAuthState("cinematic");
};

  // --------------------------------------------------
  // CLOSE LOGIN
  // --------------------------------------------------

  const handleClose = () => {
    if (
      typeof window !== "undefined" &&
      window.history.state?.idx > 0
    ) {
      router.back();
    } else {
      router.push("/");
    }
  };

  // --------------------------------------------------
  // FORM ANIMATION
  // --------------------------------------------------

  const fadeVariants = {
    initial: {
      opacity: 0,
      x:
        typeof window !== "undefined" &&
        window.innerWidth < 1024
          ? 0
          : authMode === "signup"
          ? 12
          : -12,
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
          : authMode === "signup"
          ? -12
          : 12,
    },

    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="relative h-[100dvh] lg:min-h-[100svh] w-full bg-[#111] font-sans overflow-hidden lg:overflow-x-hidden flex flex-col cursor-pointer touch-none lg:touch-auto"
      onClick={handleClose}
    >
      {/* --------------------------------------------------
          CINEMATIC LOGIN ANIMATION
      -------------------------------------------------- */}

      <AnimatePresence>
        {authState === "cinematic" && (
          <CinematicPortal
            mode={authData.mode}
            userName={authData.userName}
            onShuttersClosed={() => {
              setAuthVisible(false);
            }}
            onComplete={() => {
  console.log("CINEMATIC COMPLETE");
  console.log("REDIRECTING TO HOME");

  setAuthState("redirecting");

  router.replace("/");
}}
          />
        )}
      </AnimatePresence>

      {authVisible && (
        <>
          {/* --------------------------------------------------
              BACKGROUND
          -------------------------------------------------- */}

          <div className="fixed inset-0 z-0 pointer-events-none">
            <Image
              src="/images/register/mandap_hero.png"
              alt="Luxury Wedding Venue"
              fill
              priority
              sizes="100vw"
              quality={90}
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-black/30 z-[1]" />

            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/30 to-black/60 z-[2]" />
          </div>

          {/* --------------------------------------------------
              NAVBAR
          -------------------------------------------------- */}

          <div
            className="relative z-50 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <Navbar />
          </div>

          {/* --------------------------------------------------
              CONTENT
          -------------------------------------------------- */}

          <main className="relative z-10 w-full max-w-[1536px] mx-auto h-[calc(100dvh-70px)] lg:min-h-[100svh] pt-[72px] md:pt-[80px] pb-2 lg:pb-0 px-4 md:px-12 xl:px-16 flex flex-col lg:grid lg:grid-cols-[56%_44%] items-center justify-center gap-6 lg:gap-16 xl:gap-20 overflow-hidden lg:overflow-visible">

            {/* --------------------------------------------------
                LEFT SIDE
            -------------------------------------------------- */}

            <div className="hidden lg:flex w-full text-white pt-6 lg:pt-0 justify-start lg:justify-center">
              <div className="w-full max-w-[500px] lg:max-w-[620px]">
                <h1 className="text-[40px] lg:text-[52px] xl:text-[54px] font-serif font-medium leading-[1.05] mb-5">
                  Find the Perfect
                  <br className="hidden lg:block" />
                  <span className="lg:hidden">
                    {" "}
                  </span>
                  Venue for Every Moment.
                </h1>

                <p className="text-base lg:text-[17px] text-white/80 leading-[1.6] mb-7 font-light max-w-[480px]">
                  Discover verified wedding venues,
                  trusted vendors, and everything you
                  need to celebrate beautifully.
                </p>

                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-[10px] lg:text-xs font-semibold tracking-widest text-[#C6934A] uppercase mt-7">
                  <span>
                    Verified Venues
                  </span>

                  <span className="text-white/50">
                    ·
                  </span>

                  <span>
                    Trusted Vendors
                  </span>

                  <span className="text-white/50">
                    ·
                  </span>

                  <span>
                    Easy Booking
                  </span>
                </div>
              </div>
            </div>

            {/* --------------------------------------------------
                RIGHT SIDE AUTH
            -------------------------------------------------- */}

            <div
              className="w-full flex justify-center lg:justify-start xl:justify-center relative cursor-default lg:-translate-x-10 xl:-translate-x-16 2xl:-translate-x-24 touch-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                {authMode === "signin" ? (
                  <motion.div
                    key="signin"
                    {...fadeVariants}
                    className="w-full flex justify-center"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <SignInForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToSignup={() =>
                        handleModeSwitch("signup")
                      }
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="signup"
                    {...fadeVariants}
                    className="w-full flex justify-center"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >
                    <CreateAccountForm
                      onSuccess={handleAuthSuccess}
                      onSwitchToSignin={() =>
                        handleModeSwitch("signin")
                      }
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
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-[#111]">
          <div className="w-8 h-8 border-2 border-[#C6934A] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthenticationContent />
    </Suspense>
  );
}