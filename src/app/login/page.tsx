"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import FloatingBackground from "@/components/login/FloatingBackground";
import HeroSection from "@/components/login/HeroSection";
import LoginCard from "@/components/login/LoginCard";
import LoadingOverlay from "@/components/login/LoadingOverlay";

export default function LoginPage() {
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const [isSuccessOverlay, setIsSuccessOverlay] = useState(false);

  const handleLoadingStart = () => {
    setIsLoadingOverlay(true);
    setIsSuccessOverlay(false);
  };

  const handleLoadingEnd = () => {
    setIsLoadingOverlay(false);
    setIsSuccessOverlay(false);
  };

  const handleSuccess = () => {
    setIsLoadingOverlay(true);
    setIsSuccessOverlay(true);

    // Simulate smooth redirect after success checkmark animation
    setTimeout(() => {
      window.location.href = "/";
    }, 2200);
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden py-10 lg:py-0">
      {/* Dynamic Ambient Background with Mesh Blobs and Particles */}
      <FloatingBackground />

      {/* Main Split Screen Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[90vh] py-6">
          {/* Left Side: Hero Section Artwork & Branding */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block lg:col-span-6 xl:col-span-7 h-full"
          >
            <HeroSection />
          </motion.div>

          {/* Right Side: Floating Glassmorphism Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-1 lg:col-span-6 xl:col-span-5 flex items-center justify-center"
          >
            <LoginCard
              onLoadingStart={handleLoadingStart}
              onLoadingEnd={handleLoadingEnd}
              onSuccess={handleSuccess}
            />
          </motion.div>
        </div>
      </div>

      {/* Global Authentication Loading / Success Overlay */}
      <LoadingOverlay
        isVisible={isLoadingOverlay}
        isSuccess={isSuccessOverlay}
      />
    </main>
  );
}
