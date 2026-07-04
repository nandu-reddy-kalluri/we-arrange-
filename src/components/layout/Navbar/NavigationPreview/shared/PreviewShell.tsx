import React from "react";
import { motion } from "framer-motion";
import { previewCardTransition } from "../../animations/navigation-preview";

interface PreviewShellProps {
  children: React.ReactNode;
}

export function PreviewShell({ children }: PreviewShellProps) {
  return (
    <motion.div 
      variants={previewCardTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="absolute top-[calc(100%+14px)] left-1/2 -translate-x-1/2 z-50 origin-top flex flex-col items-center"
    >
      {/* Luxury Diamond Connector */}
      <div className="w-2.5 h-2.5 rotate-45 bg-[#FBF9F6] border-t border-l border-[#C5A880]/30 shadow-[-2px_-2px_6px_rgba(197,168,128,0.15)] relative -mb-1.5 z-10" />
      
      {/* Preview Card Body */}
      <div className="w-[360px] bg-[#FBF9F6] rounded-[28px] overflow-hidden border border-[#C5A880]/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05),0_0_20px_rgba(197,168,128,0.08)] relative group transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_15px_45px_-8px_rgba(0,0,0,0.08),0_0_25px_rgba(197,168,128,0.12)] hover:border-[#C5A880]/40">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 mix-blend-multiply pointer-events-none z-0" />
        <div className="relative z-10 p-5 flex flex-col gap-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
