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
      transition={{ duration: 0.6 }}
      className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:gap-x-8 md:gap-y-3"
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
          className="text-[9px] md:text-[11px] uppercase tracking-[0.15em] md:tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors duration-300"
        >
          {item.label}
        </Link>
      ))}
    </motion.div>
  );
}
