import React from "react";
import { ShieldCheck, Star, MapPin, Handshake } from "lucide-react";

export function TrustStrip() {
  const features = [
    { icon: <Handshake className="w-5 h-5 text-accent-gold" />, label: "Human Concierge" },
    { icon: <ShieldCheck className="w-5 h-5 text-accent-gold" />, label: "Verified Venues" },
    { icon: <Star className="w-5 h-5 text-accent-gold" />, label: "Transparent Quotes" },
    { icon: <MapPin className="w-5 h-5 text-accent-gold" />, label: "Hyderabad Experts" },
  ];

  return (
    <div className="hidden md:block w-full bg-neutral-charcoal py-7 border-y border-white/10 relative z-20 shadow-[0_-12px_40px_-12px_rgba(0,0,0,0.15)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: single row */}
        <div className="flex justify-between items-center">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {feature.icon}
              <span className="text-sm font-medium text-white tracking-wide">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
