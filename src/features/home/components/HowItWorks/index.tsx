import React from "react";
import { InteractiveStepper } from "./InteractiveStepper";

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-28 bg-neutral-cream relative overflow-hidden border-t border-b border-neutral-border">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 flex flex-col items-center gap-3">
          <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em]">
            COMPARE • Compare Multiple Quotations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-charcoal">
            Reviewing Your Curated Options
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-neutral-muted max-w-xl leading-relaxed mt-1">
            See how our concierge replaces weeks of research with a premium, swipe-through comparison sheet.
          </p>
          <div className="w-14 h-[2px] bg-gradient-to-r from-accent-gold to-primary mt-2" />
        </div>
        <InteractiveStepper />
      </div>
    </section>
  );
}
