"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

export function FooterSocials() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex items-center gap-3"
    >
      {[Instagram, Facebook, Twitter, Youtube].map((Icon, idx) => (
        <Link 
          key={idx} 
          href="#" 
          className="w-8 h-8 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex items-center justify-center text-[#C89B3C]/70 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:bg-[#C89B3C]/10 hover:text-[#C89B3C] hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(200,155,60,0.4)] hover:border-[#C89B3C]/60 transition-all duration-300 ease-out"
        >
          <Icon className="w-[14px] h-[14px]" />
        </Link>
      ))}
    </motion.div>
  );
}
