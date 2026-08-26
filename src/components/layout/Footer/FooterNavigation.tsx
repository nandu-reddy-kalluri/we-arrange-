"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export function FooterNavigation() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3"
    >
      {[
        { label: "Venues", href: "/venues" },
        { label: "Vendors", href: "/vendors" },
        { label: "Inspiration", href: "/inspiration" },
        { label: "Wedding Studio", href: "/wedding-studio" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Terms", href: "/terms" },
        { label: "Privacy", href: "/privacy" },
      ].map((item) => (
        <Link 
          key={item.label} 
          href={item.href} 
          className="text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors duration-300 drop-shadow-[0_0_10px_rgba(255,255,255,0)] hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        >
          {item.label}
        </Link>
      ))}
    </motion.div>
  );
}
