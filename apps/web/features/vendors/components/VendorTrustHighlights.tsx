import React from "react";
import { Check } from "lucide-react";

export function VendorTrustHighlights() {
  const highlights = [
    "Luxury Bridal Specialist",
    "Celebrity Makeup Experience",
    "Destination Weddings",
    "Premium International Products",
    "Travels Across India"
  ];

  return (
    <div className="border-t border-gray-150 pt-6 mt-6">
      <span className="text-[9px] font-black uppercase text-neutral-muted block tracking-widest mb-4">
        Why Couples Choose This Artist
      </span>
      <ul className="flex flex-col gap-3">
        {highlights.map((item, i) => (
          <li key={i} className="flex items-center gap-2.5 text-xs text-neutral-charcoal">
            <Check className="w-3.5 h-3.5 text-[#C5A880] shrink-0" strokeWidth={3} />
            <span className="font-semibold">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
