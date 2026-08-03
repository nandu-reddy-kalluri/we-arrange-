"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingOverlayProps {
  isVisible: boolean;
  isSuccess?: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  isSuccess = false,
  message = "Authenticating your credentials...",
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 15 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center p-8 sm:p-10 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-[#C5A880]/50 shadow-[0_20px_50px_rgba(139,38,62,0.25)] max-w-sm w-full text-center space-y-4"
          >
            {isSuccess ? (
              /* Success Checkmark Animation */
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#8B263E] to-[#5E1627] shadow-lg border border-[#C5A880]">
                <svg
                  className="w-10 h-10 text-[#C5A880]"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </svg>
              </div>
            ) : (
              /* Spinning Luxury Ring Animation */
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C5A880] border-r-[#8B263E]"
                />
                {/* Inner Ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#C5A880] border-l-[#A8324E]"
                />
                {/* Center Monogram Emblem */}
                <span className="font-serif text-sm font-bold text-[#8B263E] dark:text-[#C5A880]">
                  YMWA
                </span>
              </div>
            )}

            {/* Status Message */}
            <motion.p
              key={isSuccess ? "success" : "loading"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-base font-serif font-medium text-[#2D2D2D] dark:text-[#FAF9F6]"
            >
              {isSuccess ? "Welcome back to YouMarriageWeArrange" : message}
            </motion.p>

            <span className="text-xs text-[#6D6D6D] dark:text-[#A19890]">
              {isSuccess
                ? "Redirecting to your private concierge portal..."
                : "Securing your encryption session..."}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
