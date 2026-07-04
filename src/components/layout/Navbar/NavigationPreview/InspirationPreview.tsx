import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { photography } from "@/lib/design/photography";
import { PreviewShell } from "./shared/PreviewShell";
import { PreviewHeader } from "./shared/PreviewHeader";
import { PreviewCTA } from "./shared/PreviewCTA";
import { previewImageFade } from "../animations/navigation-preview";

export function InspirationPreview() {
  return (
    <PreviewShell>
      <PreviewHeader label="Editorial Design" heading="Wedding Inspiration" />
      
      <motion.div variants={previewImageFade} className="grid grid-cols-2 gap-3 mt-1 mb-2">
        <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden group">
          <Image 
            src={photography.assignments.navInspirationFront}
            alt="Editorial Wedding"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
        <div className="relative w-full aspect-[4/5] rounded-[16px] overflow-hidden mt-6 group">
          <Image 
            src={photography.assignments.navInspirationBack}
            alt="Bridal Details"
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        </div>
      </motion.div>
      
      <PreviewCTA href="/inspiration" text="Explore Moodboards" />
    </PreviewShell>
  );
}
