"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

interface ComingSoonProps {
  title: string;
  description: string;
  returnTo?: string;
  returnLabel?: string;
}

export function ComingSoon({ 
  title, 
  description, 
  returnTo = "/", 
  returnLabel = "Return Home" 
}: ComingSoonProps) {
  const router = useRouter();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-neutral-cream px-4 py-12 relative overflow-hidden">
      {/* Decorative luxury mesh background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#C5A880]/10 via-transparent to-[#8B263E]/5 blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-lg text-center space-y-6 bg-white/60 backdrop-blur-sm p-10 rounded-3xl border border-gray-150 shadow-sm">
        
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#FAF9F6] border border-[#C5A880]/40 shadow-sm text-[#C5A880] mb-2">
          <Clock className="w-6 h-6" />
        </div>
        
        <h1 className="font-serif text-3xl font-extrabold text-[#2D2D2D] leading-tight">
          {title}
        </h1>
        
        <p className="text-sm text-neutral-muted leading-relaxed font-sans">
          {description}
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 w-full">
          <button
            onClick={() => router.back()}
            className="w-full sm:w-1/2 px-6 py-3 rounded-full border border-gray-250 bg-white hover:bg-gray-50 text-neutral-charcoal font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          
          <Link
            href={returnTo}
            className="w-full sm:w-1/2 px-6 py-3 rounded-full bg-[#8B263E] text-white font-bold text-[11px] uppercase tracking-wider shadow-md hover:bg-[#6e1c2f] transition-all flex items-center justify-center cursor-pointer"
          >
            {returnLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
