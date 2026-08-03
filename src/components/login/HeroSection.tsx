"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Crown, ShieldCheck, Quote } from "lucide-react";
import WeddingIllustration from "./WeddingIllustration";

const TESTIMONIALS = [
  {
    quote:
      "The most seamless wedding planning experience imaginable. Our concierge handled everything from Taj Falaknuma to elite decor.",
    author: "Ananya & Vikram",
    location: "Hyderabad • Luxury Wedding",
  },
  {
    quote:
      "Having a dedicated specialist negotiate quotes saved us weeks of stress. Truly the gold standard of concierge service.",
    author: "Rohan & Meera",
    location: "Banjara Hills • Royal Celebration",
  },
  {
    quote:
      "Exquisite attention to detail. The portal gave us complete transparency and direct access to top-tier vendors.",
    author: "Kavya & Siddharth",
    location: "Jubilee Hills • Destination Wedding",
  },
];

export const HeroSection: React.FC = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col justify-between h-full py-6 px-4 lg:px-12 text-[#2D2D2D] dark:text-[#FAF9F6]">
      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3"
      >
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#8B263E] to-[#5E1627] flex items-center justify-center shadow-md border border-[#C5A880]/40">
          <Crown className="w-5 h-5 text-[#C5A880]" />
        </div>
        <div>
          <span className="font-serif font-bold text-xl tracking-wider text-[#8B263E] dark:text-[#F0E7DB] block leading-none">
            YouMarriage<span className="text-[#C5A880]">WeArrange</span>
          </span>
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#C5A880] font-semibold block mt-1">
            Premium Wedding Concierge
          </span>
        </div>
      </motion.div>

      {/* Hero Central Content & Artwork */}
      <div className="my-auto py-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B263E]/10 border border-[#C5A880]/30 backdrop-blur-md mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
          <span className="text-xs font-medium tracking-wide text-[#8B263E] dark:text-[#C5A880]">
            Bespoke Luxury Portal
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.15] text-[#2D2D2D] dark:text-[#FFFFFF] mb-4"
        >
          Where Forever Begins with{" "}
          <span className="bg-gradient-to-r from-[#8B263E] via-[#C5A880] to-[#8B263E] bg-clip-text text-transparent">
            Bespoke Perfection.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="text-sm sm:text-base text-[#6D6D6D] dark:text-[#D1C7BD] max-w-lg leading-relaxed font-normal mb-6"
        >
          Access your private member portal to review personal venue quotes,
          negotiated packages, and manage your custom wedding timeline with our
          dedicated specialists.
        </motion.p>

        {/* Wedding Illustration Vector Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="relative my-4"
        >
          <WeddingIllustration />
        </motion.div>
      </div>

      {/* Bottom Testimonial & Trust Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7 }}
        className="space-y-4"
      >
        {/* Testimonial Box */}
        <div className="relative rounded-2xl bg-white/50 dark:bg-zinc-900/50 p-4 border border-[#C5A880]/30 backdrop-blur-md">
          <Quote className="absolute top-3 right-3 w-5 h-5 text-[#C5A880]/30" />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4 }}
              className="space-y-1"
            >
              <p className="text-xs sm:text-sm text-[#2D2D2D] dark:text-[#E8E2DA] italic font-serif leading-relaxed">
                "{TESTIMONIALS[currentTestimonial].quote}"
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-[#8B263E] dark:text-[#C5A880]">
                  {TESTIMONIALS[currentTestimonial].author}
                </span>
                <span className="text-[11px] text-[#6D6D6D] dark:text-[#A19890]">
                  {TESTIMONIALS[currentTestimonial].location}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-between text-xs text-[#6D6D6D] dark:text-[#B0A79E] pt-2 border-t border-[#C5A880]/20">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
            <span>Verified Luxury Concierge</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>500+ Curated Weddings</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
