import React from "react";
import { ShieldCheck, Star, Clock } from "lucide-react";

export function TrustStrip() {
  return (
    <div className="w-full bg-neutral-charcoal py-4 md:hidden">
      <div className="flex justify-center items-center gap-4 sm:gap-6 px-4">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-accent-gold" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Verified Concierge</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-neutral-muted/50" />
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-accent-gold" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">Luxury Venues</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-neutral-muted/50" />
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-accent-gold" />
          <span className="text-[10px] font-bold text-white tracking-widest uppercase">24/7 Support</span>
        </div>
      </div>
    </div>
  );
}
