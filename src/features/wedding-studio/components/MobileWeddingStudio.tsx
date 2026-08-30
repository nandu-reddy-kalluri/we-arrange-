

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle, Globe, Smartphone, Users } from "lucide-react";
import Image from "next/image";

export function MobileWeddingStudio() {
  return (
    <div className="flex flex-col bg-[#FBF8F4] min-h-screen pb-20">
      
      {/* 1. Simplified Mobile Hero */}
      <section className="px-5 pt-8 pb-10 flex flex-col items-center text-center">
        <span className="text-[10px] font-black uppercase text-[#C5A880] tracking-[0.3em] mb-4">
          Wedding Studio
        </span>
        <h1 className="font-serif text-4xl text-neutral-900 leading-[1.1] mb-4">
          Create. Personalize.<br />
          <span className="text-[#8B263E] italic">Celebrate Beautifully.</span>
        </h1>
        <p className="text-sm text-neutral-600 mb-8 max-w-sm mx-auto leading-relaxed">
          Design stunning eInvites and beautiful wedding websites that tell your unique love story with seamless RSVP management.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link 
            href="#create"
            className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] shadow-md flex items-center justify-center gap-2"
          >
            Start Creating <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="#templates"
            className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-neutral-700 bg-white border border-[#C5A880]/30 shadow-sm flex items-center justify-center"
          >
            Explore Templates
          </Link>
        </div>
      </section>

      {/* 2. Hero Mockup Image (Static, no complex CSS rendering) */}
      <section className="px-5 pb-12">
        <div className="relative w-full aspect-[4/5] rounded-[24px] overflow-hidden shadow-lg border border-gray-100">
          <Image
            src="/images/editorial/insp_bridal.png" // using a reliable mockup or generic image
            alt="Wedding Studio Templates"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-md mb-2 inline-block">Premium</span>
            <h3 className="font-serif text-2xl">Digital Elegance</h3>
          </div>
        </div>
      </section>

      {/* 3. Core Features List (Simplified) */}
      <section className="px-5 py-10 bg-white border-y border-gray-100">
        <h2 className="font-serif text-2xl text-neutral-900 mb-8 text-center">Everything you need</h2>
        
        <div className="flex flex-col gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF5ED] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Stunning eInvites</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">Send animated, responsive invites directly via WhatsApp or Email.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF5ED] flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Custom Wedding Websites</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">Your story, timeline, and gallery in one beautiful hub.</p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#FAF5ED] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#C5A880]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 mb-1">Smart RSVP Management</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">Track attendances, meals, and plus-ones from a single dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Final Inline CTA */}
      <div className="px-5 py-8 bg-[#FBF8F4]">
        <Link 
          href="#create"
          className="w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white bg-[#8B263E] shadow-[0_8px_20px_rgba(139,38,62,0.25)] active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
        >
          Start Your Design <Sparkles className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
