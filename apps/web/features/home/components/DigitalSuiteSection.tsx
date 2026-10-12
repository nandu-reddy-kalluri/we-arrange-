"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { typography, colors, radii, spacing, layout, grid, shadows } from "@/styles";

export default function DigitalSuiteSection() {
  return (
    <section className={`py-10 lg:py-12 ${colors.bgSecondary} relative overflow-hidden border-t border-b ${colors.border}`}>
      <div className={`${layout.maxWidth} ${spacing.container}`}>
        
        {/* Header Section */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-6 gap-2">
          <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em]">
            Digital • Premium Tech
          </span>
          <h2 className={typography.sectionTitle}>
            Your Digital Wedding Experience
          </h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`w-full max-w-5xl mx-auto bg-[#FAF7F2] ${radii.card} overflow-hidden border border-[#E8D8BC] transition-colors duration-300 shadow-[0_12px_40px_rgba(0,0,0,0.06)] flex flex-col md:flex-row relative group`}
        >
          {/* Left: Illustration Area (Soft Gradient) */}
          <div className="w-full md:w-[40%] relative aspect-video md:aspect-auto bg-gradient-to-br from-[#FAF8F5] via-[#F4EFE6] to-[#EBE3D5] flex items-center justify-center p-6 overflow-hidden">
             {/* Decorative abstract elements */}
             <div className="w-48 h-48 md:w-72 md:h-72 bg-gradient-to-tr from-accent-gold/20 to-primary/5 rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
             {/* Soft illustration substitute */}
             <Image 
                src="/images/editorial/digital_invitation.png"
                alt="Digital Suite"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover opacity-60 mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent md:bg-gradient-to-r" />
          </div>

          {/* Right: Content Area */}
          <div className="w-full md:w-[60%] p-6 md:p-8 lg:p-10 flex flex-col justify-center relative z-10 bg-white md:bg-white/50 backdrop-blur-sm">
            <h3 className={`${typography.cardTitle} mb-4 md:mb-6 text-neutral-charcoal`}>
              Everything you need for a modern celebration.
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              {[
                "Digital Invitation", "Wedding Website", "Guest RSVP", 
                "Guest Timeline", "QR Check-in", "Photo Gallery"
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary text-[10px] font-black">✓</span>
                  </div>
                  <span className="text-[14px] md:text-[15px] font-semibold text-neutral-charcoal">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/digital-suite"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C8A165] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:-translate-y-1 hover:bg-[#B68F55] shadow-lg transition-all w-full sm:w-fit"
            >
              Explore Digital Suite <span>→</span>
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
