import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { previewChildTransition } from "../../animations/navigation-preview";

interface PreviewCTAProps {
  href: string;
  text: string;
}

export function PreviewCTA({ href, text }: PreviewCTAProps) {
  return (
    <motion.div variants={previewChildTransition} className="px-1 pb-1 mt-2">
      <Link 
        href={href}
        className="flex items-center gap-2 text-xs font-bold text-[#8B263E] transition-colors w-fit group"
      >
        <span className="uppercase tracking-widest border-b border-[#8B263E]/30 pb-0.5 group-hover:border-[#8B263E] transition-colors">
          {text}
        </span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
      </Link>
    </motion.div>
  );
}
