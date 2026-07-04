import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { photography } from "@/lib/design/photography";
import { PreviewShell } from "./shared/PreviewShell";
import { PreviewHeader } from "./shared/PreviewHeader";
import { PreviewCTA } from "./shared/PreviewCTA";
import { previewImageFade } from "../animations/navigation-preview";

export function VendorPreview() {
  const MOCK_VENDORS = [
    photography.decor[0],
    photography.editorial[1],
    photography.decor[1]
  ];

  return (
    <PreviewShell>
      <motion.div variants={previewImageFade} className="flex justify-center -space-x-4 py-2">
        {MOCK_VENDORS.map((src, i) => (
          <div key={i} className={`relative w-20 h-20 rounded-full border-4 border-[#FBF9F6] shadow-sm overflow-hidden z-[${3-i}]`}>
            <Image src={src} alt="Vendor" fill className="object-cover" />
          </div>
        ))}
      </motion.div>
      
      <PreviewHeader label="Concierge Verified" heading="Trusted Partners" />
      
      <div className="px-1 -mt-1 text-[13px] font-medium text-[#6D6D6D] leading-relaxed">
        Photography, decor, and makeup artists selected for exceptional quality.
      </div>
      
      <PreviewCTA href="/vendors" text="Meet Our Experts" />
    </PreviewShell>
  );
}
