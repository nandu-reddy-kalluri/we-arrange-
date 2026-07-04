"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check, Sparkles, Send, FileText, BarChart3 } from "lucide-react";
import { useAnalytics } from "@/lib/analytics/hooks";
import { typography, colors, radii } from "@/styles";

const COMPARISON_STEPS = [
  {
    id: "step1",
    title: "1. Share Requirements",
    phase: "Dream",
    description: "Submit your guest list size, budget, and desired areas. Your specialist receives it immediately.",
  },
  {
    id: "step2",
    title: "2. Personal Bidding",
    phase: "Plan",
    description: "Our concierge team contacts venues directly. We negotiate and gather multiple personalized quotations for you.",
  },
  {
    id: "step3",
    title: "3. Side-by-Side Comparison",
    phase: "Compare",
    description: "Review all collected proposals inside a single clean interface comparing venue fees, inclusions, and restrictions.",
  },
  {
    id: "step4",
    title: "4. Best Option Chosen",
    phase: "Choose",
    description: "Secure the perfect venue under our negotiation guidelines and proceed confidently to your dream celebration.",
  },
];

export function InteractiveStepper() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { trackCompareSwipe } = useAnalytics();

  const nextStep = () => {
    setActiveIdx((prev) => {
      const next = prev < COMPARISON_STEPS.length - 1 ? prev + 1 : prev;
      if (next !== prev && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      return next;
    });
  };

  const prevStep = () => {
    setActiveIdx((prev) => {
      const prevIdx = prev > 0 ? prev - 1 : prev;
      if (prevIdx !== prev && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      return prevIdx;
    });
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      trackCompareSwipe("next");
      nextStep();
    } else if (info.offset.x > swipeThreshold) {
      trackCompareSwipe("prev");
      prevStep();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-5xl mx-auto relative" style={{ position: "relative" }}>
      <div className="lg:col-span-5 flex flex-col justify-between text-left gap-8">
        <motion.div 
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="relative flex flex-col gap-3 lg:gap-6 z-10 touch-pan-y"
        >
          <div className="absolute left-[36px] lg:hidden top-8 bottom-8 w-[2px] bg-neutral-border z-[-1]" />
          {COMPARISON_STEPS.map((step, idx) => {
            const isActive = idx === activeIdx;
            return (
              <div
                key={step.id}
                onClick={() => {
                  if (window.innerWidth >= 1024) setActiveIdx(idx);
                }}
                className={`w-full text-left p-4 lg:p-8 min-h-[48px] ${radii.card} border transition-all duration-300 flex items-start gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary relative z-10 ${
                  isActive
                    ? `${colors.bgPrimary} border-accent-gold shadow-sm lg:shadow-md`
                    : `bg-white/40 lg:bg-transparent border-transparent lg:hover:${colors.bgPrimary}/40`
                }`}
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "bg-primary/10 lg:bg-neutral-border text-primary lg:text-neutral-muted"
                  }`}
                >
                  {idx + 1}
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-accent-gold tracking-widest block mb-0.5">
                    {step.phase} Phase
                  </span>
                  <h3 className={`${typography.cardTitle} leading-snug`}>
                    {step.title}
                  </h3>
                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`${typography.cardDesc} mt-2 overflow-hidden`}
                      >
                        {step.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="flex items-center gap-4 pt-2 lg:pt-4 border-t border-neutral-border/50">
          <button
            onClick={prevStep}
            className="w-12 h-12 rounded-full border border-neutral-border bg-white flex items-center justify-center text-neutral-charcoal hover:bg-primary hover:text-white hover:border-primary transition-colors"
            aria-label="Previous step"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs font-black uppercase tracking-wider text-accent-gold">
            {activeIdx + 1} / {COMPARISON_STEPS.length}
          </span>
          <button
            onClick={nextStep}
            className="w-12 h-12 rounded-full border border-neutral-border bg-white flex items-center justify-center text-neutral-charcoal hover:bg-primary hover:text-white hover:border-primary transition-colors"
            aria-label="Next step"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      <motion.div 
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ position: "relative" }}
        className="hidden lg:flex lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-border shadow-md flex-col justify-center min-h-[360px] relative overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
      >
        <AnimatePresence mode="wait">
          {activeIdx === 0 && (
            <motion.div
              key="vstep1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                <span className="text-xs font-black text-primary uppercase tracking-wider">
                  Submit Requirements
                </span>
                <Send className="w-4 h-4 text-accent-gold" />
              </div>
              <div className="bg-neutral-cream p-5 rounded-2xl border border-neutral-border space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-muted font-bold uppercase tracking-wider text-[9px]">Location</span>
                  <span className="font-extrabold text-neutral-charcoal">Banjara Hills, Hyderabad</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-muted font-bold uppercase tracking-wider text-[9px]">Expected Guests</span>
                  <span className="font-extrabold text-neutral-charcoal">500 Guests</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-muted font-bold uppercase tracking-wider text-[9px]">Max Budget Limit</span>
                  <span className="font-extrabold text-neutral-charcoal">₹30,00,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-muted font-bold uppercase tracking-wider text-[9px]">Categories</span>
                  <span className="font-extrabold text-primary">Venue + Catering + Decor</span>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-neutral-muted text-center italic">
                Press "Next" or swipe to watch our concierge collect bidded options...
              </p>
            </motion.div>
          )}

          {activeIdx === 1 && (
            <motion.div
              key="vstep2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                <span className="text-xs font-black text-primary uppercase tracking-wider">
                  Gathering Custom Bids
                </span>
                <FileText className="w-4 h-4 text-accent-gold" />
              </div>
              <div className="space-y-3">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="p-3 bg-white border border-neutral-border rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-neutral-charcoal">Taj Falaknuma Bid</span>
                  </div>
                  <span className="text-xs font-bold text-primary">Collected ✓</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="p-3 bg-white border border-neutral-border rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-neutral-charcoal">Fort Grand Bid</span>
                  </div>
                  <span className="text-xs font-bold text-primary">Collected ✓</span>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="p-3 bg-white border border-neutral-border rounded-xl flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
                    <span className="text-xs font-black text-neutral-charcoal">Chowmahalla Palace Bid</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-muted">Negotiating...</span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {activeIdx === 2 && (
            <motion.div
              key="vstep3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-4 text-left"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-border">
                <span className="text-xs font-black text-primary uppercase tracking-wider">
                  Side-By-Side Quote Matrix
                </span>
                <BarChart3 className="w-4 h-4 text-accent-gold" />
              </div>
              <div className="overflow-x-auto border border-neutral-border rounded-2xl">
                <table className="w-full text-[10px] sm:text-xs">
                  <thead>
                    <tr className="bg-neutral-cream border-b border-neutral-border">
                      <th className="p-3 text-left font-black text-neutral-muted uppercase tracking-wider">Property</th>
                      <th className="p-3 text-right font-black text-neutral-muted uppercase tracking-wider">Base Cost</th>
                      <th className="p-3 text-center font-black text-neutral-muted uppercase tracking-wider">Catering</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-neutral-cream">
                      <td className="p-3 font-bold text-neutral-charcoal">Taj Falaknuma</td>
                      <td className="p-3 text-right text-neutral-muted">₹45 Lakhs</td>
                      <td className="p-3 text-center text-neutral-muted">Included</td>
                    </tr>
                    <tr className="border-b border-neutral-cream">
                      <td className="p-3 font-bold text-neutral-charcoal">Chowmahalla</td>
                      <td className="p-3 text-right text-neutral-muted">₹30 Lakhs</td>
                      <td className="p-3 text-center text-neutral-muted">External Allowed</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-neutral-charcoal">Fort Grand</td>
                      <td className="p-3 text-right text-neutral-muted">₹25 Lakhs</td>
                      <td className="p-3 text-center text-neutral-muted">Ingraded</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeIdx === 3 && (
            <motion.div
              key="vstep4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center text-center gap-5 pt-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent-gold flex items-center justify-center text-white shadow-md">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-accent-gold tracking-widest block mb-1">
                  Matched & Confirmed
                </span>
                <h3 className="font-serif text-xl font-bold text-neutral-charcoal">
                  Chowmahalla Palace Selected!
                </h3>
                <p className="text-xs font-semibold text-neutral-muted max-w-sm mt-2 leading-relaxed">
                  We negotiated standard rates down by 15%, secured preferred external catering permissions, and finalized bookings for December 12th.
                </p>
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-primary/10">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                Concierge Secured Best Price
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
