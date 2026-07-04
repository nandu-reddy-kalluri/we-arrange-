import React from "react";
import { motion } from "framer-motion";
import { previewChildTransition } from "../../animations/navigation-preview";

interface PreviewHeaderProps {
  label: string;
  heading: string;
}

export function PreviewHeader({ label, heading }: PreviewHeaderProps) {
  return (
    <div className="px-1 flex flex-col gap-1.5">
      <motion.span 
        variants={previewChildTransition}
        className="text-[10px] font-black uppercase tracking-widest text-[#C5A880]"
      >
        {label}
      </motion.span>
      <motion.h3 
        variants={previewChildTransition}
        className="font-serif text-[26px] font-bold text-[#2D2D2D] leading-tight tracking-tight"
      >
        {heading}
      </motion.h3>
    </div>
  );
}
