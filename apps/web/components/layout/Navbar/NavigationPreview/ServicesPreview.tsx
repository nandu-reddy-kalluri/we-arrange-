import React from "react";
import { motion } from "framer-motion";
import { PreviewShell } from "./shared/PreviewShell";
import { PreviewHeader } from "./shared/PreviewHeader";
import { PreviewCTA } from "./shared/PreviewCTA";
import { previewImageFade } from "../animations/navigation-preview";

export function ServicesPreview() {
  const journey = [
    { step: "Dream", desc: "Tell us your vision" },
    { step: "Plan", desc: "We negotiate" },
    { step: "Compare", desc: "Side-by-side proposals" },
    { step: "Choose", desc: "Book confidently" }
  ];

  return (
    <PreviewShell>
      <PreviewHeader label="Signature Experience" heading="The Journey" />
      
      <motion.div variants={previewImageFade} className="px-1 flex flex-col gap-4 mt-2 relative">
        <div className="absolute left-3 top-2 bottom-2 w-[1px] bg-gradient-to-b from-[#C5A880]/50 via-[#C5A880]/20 to-transparent" />
        
        {journey.map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 relative z-10">
            <div className="w-[26px] h-[26px] rounded-full bg-[#FBF9F6] border border-[#C5A880]/40 flex items-center justify-center shrink-0 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-[15px] font-bold text-[#2D2D2D]">{item.step}</span>
              <span className="text-[11px] font-medium text-[#6D6D6D]">{item.desc}</span>
            </div>
          </div>
        ))}
      </motion.div>
      
      <div className="mt-2">
        <PreviewCTA href="/services" text="Discover the Concierge" />
      </div>
    </PreviewShell>
  );
}
