import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { photography } from "@/lib/design/photography";
import { PreviewShell } from "./shared/PreviewShell";
import { PreviewHeader } from "./shared/PreviewHeader";
import { PreviewCTA } from "./shared/PreviewCTA";
import { previewImageFade } from "../animations/navigation-preview";

export function VenuePreview() {
  return (
    <PreviewShell>
      <motion.div variants={previewImageFade} className="w-full aspect-[16/9] rounded-[20px] overflow-hidden relative group">
        <Image 
          src={photography.assignments.navVenue}
          alt="Royal Palace"
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#8B263E]">★★★★★</span>
        </div>
      </motion.div>
      
      <PreviewHeader label="Royal Collection" heading="Heritage Palaces" />
      
      {/* Hard Facts instead of description */}
      <div className="px-1 flex flex-col gap-1.5 -mt-1">
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#6D6D6D]">
          <span className="w-1 h-1 rounded-full bg-[#C5A880]" />
          300–1500 Guests
        </div>
        <div className="flex items-center gap-2 text-[12px] font-medium text-[#6D6D6D]">
          <span className="w-1 h-1 rounded-full bg-[#C5A880]" />
          Indoor & Outdoor Spaces
        </div>
      </div>
      
      <PreviewCTA href="/venues" text="View Collection" />
    </PreviewShell>
  );
}
