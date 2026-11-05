"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const SOCIAL_LINKS = [
  { name: "Instagram", href: "https://instagram.com", icon: Instagram },
  { name: "Facebook", href: "https://facebook.com", icon: Facebook },
  { name: "Twitter / X", href: "https://x.com", icon: Twitter },
  { name: "YouTube", href: "https://youtube.com", icon: Youtube },
];

export function FooterSocials() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="flex items-center gap-3"
      role="list"
      aria-label="Social media links"
    >
      {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
        <Link 
          key={name} 
          href={href}
          role="listitem"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit our ${name} page`}
          className="w-11 h-11 rounded-full bg-white/[0.04] backdrop-blur-2xl border border-white/10 flex items-center justify-center text-[#C89B3C]/90 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:bg-[#C89B3C]/10 hover:text-[#C89B3C] hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(200,155,60,0.4)] hover:border-[#C89B3C]/60 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </Link>
      ))}
    </motion.div>
  );
}
