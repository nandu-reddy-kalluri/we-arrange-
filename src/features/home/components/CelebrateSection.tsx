"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CelebrateSection() {
  const containerRef = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const mouseRotateX = useTransform(y, [-400, 400], [8, -8]);
  const mouseRotateY = useTransform(x, [-400, 400], [-8, 8]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full pt-20 lg:pt-32 overflow-hidden bg-[#FAF7F2] perspective-[1500px]"
    >
      {/* 1. Deep Atmospheric Canvas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Luxury Paper Grain */}
        <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.04] mix-blend-overlay" />
        
        {/* Soft Floral Shadows (Blurred Stencil) */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,black_1px,transparent_6px)] bg-[size:60px_60px] opacity-[0.015] mix-blend-multiply" />
        
        {/* Subtle Moving Champagne Gradient */}
        <motion.div 
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-br from-transparent via-[#C89B3C]/5 to-transparent bg-[length:200%_200%]"
        />

        {/* Tiny Golden Particles (Idle Dust) */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={`ambient-dust-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-tr from-[#C89B3C] to-[#E8C875] rounded-full blur-[1px]"
            style={{ left: `${10 + Math.random() * 80}%`, top: `${10 + Math.random() * 80}%` }}
            animate={{ y: [0, -100, 0], opacity: [0, 0.3, 0] }}
            transition={{ duration: 8 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 4 }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex flex-col lg:flex-row items-center gap-16 lg:gap-8 pb-32">
        
        {/* LEFT 40%: Copy, CTA, & Active Journey */}
        <div className="w-full lg:w-[40%] flex flex-col items-start justify-center z-20">
          <motion.span 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="text-[9px] sm:text-[10px] font-black uppercase text-[#C89B3C] tracking-[0.3em] mb-4"
          >
            YOUR CELEBRATION BEGINS
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
            whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[40px] sm:text-[48px] md:text-[56px] tracking-tight leading-[1.05] mb-8 text-neutral-950"
          >
            <span className="font-serif font-bold block">Everything For Your Wedding,</span>
            <span className="font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-[#C89B3C] to-[#E8C875] block mt-1 drop-shadow-[0_2px_10px_rgba(200,155,60,0.2)]">
              Beautifully Together.
            </span>
          </motion.h2>

          {/* Liquid Gold Hover Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.4 }}
            className="group relative px-8 py-4 rounded-full overflow-hidden text-xs font-black uppercase tracking-widest text-white transition-all duration-500 shadow-[0_10px_30px_rgba(18,0,4,0.15)] hover:shadow-[0_15px_40px_rgba(200,155,60,0.4)] flex items-center justify-center gap-3 bg-[#120004]"
          >
            {/* Liquid gold background fill on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C89B3C] to-[#E8C875] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            {/* Intermittent shine pass */}
            <motion.div 
              className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 opacity-80"
              animate={{ x: ["-200%", "300%", "300%", "300%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
            
            <span className="relative z-10 text-white transition-colors duration-300">Start Planning</span>
            <ArrowRight className="w-4 h-4 relative z-10 text-[#C89B3C] group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1" />
          </motion.button>

          {/* Unified Active Timeline */}
          <motion.div 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.6 }}
            className="relative flex items-center mt-12 overflow-hidden w-full max-w-[300px]"
          >
            {/* Base line */}
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-200 -translate-y-1/2 -z-10" />
            
            {/* Traveling Gold Light */}
            <motion.div 
              className="absolute top-1/2 left-0 w-[40px] h-[2px] bg-gradient-to-r from-transparent via-[#C89B3C] to-transparent -translate-y-1/2 -z-10 shadow-[0_0_8px_rgba(200,155,60,0.8)] blur-[0.5px]"
              animate={{ x: [-50, 350] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="flex items-center justify-between w-full">
              {[
                { num: "01", text: "Dream" },
                { num: "02", text: "Explore" },
                { num: "03", text: "Celebrate" }
              ].map((step) => (
                <div key={step.text} className="flex items-center gap-1.5 bg-[#FAF7F2] px-2 shadow-[0_0_10px_#FAF7F2]">
                  <span className="text-[8px] font-sans text-[#C89B3C]/80 font-bold">{step.num}</span>
                  <span className="text-[9px] uppercase tracking-widest font-black text-neutral-800">
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* RIGHT 60%: Memory Capsule & Experience Flow */}
        <div className="w-full lg:w-[60%] h-[450px] lg:h-[550px] relative flex items-center justify-center transform-style-preserve-3d mt-12 lg:mt-0 perspective-[1500px]">
          
          {/* Animated SVG Curved Path (Apple AirPods Style) */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg viewBox="0 0 500 500" className="w-full h-full overflow-visible">
              <motion.path 
                d="M 50 100 C 150 -50, 450 100, 350 300 C 250 500, 50 400, 100 250"
                fill="none" stroke="rgba(200,155,60,0.15)" strokeWidth="1" strokeDasharray="5 5"
              />
              <motion.circle 
                cx="0" cy="0" r="3" fill="#E8C875" className="shadow-[0_0_10px_#E8C875]"
                style={{ offsetPath: 'path("M 50 100 C 150 -50, 450 100, 350 300 C 250 500, 50 400, 100 250")' } as any}
                animate={{ offsetDistance: ["0%", "100%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              />
            </svg>
          </div>

          {/* Magnetic Outer Container */}
          <motion.div 
            style={{ rotateX: mouseRotateX, rotateY: mouseRotateY }}
            className="relative w-full h-full flex items-center justify-center transform-style-preserve-3d z-10"
          >
            {/* Idle Outer Container */}
            <motion.div
              animate={{ rotateY: [-5, 5, -5], y: [-12, 12, -12] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full h-full flex items-center justify-center transform-style-preserve-3d"
            >
              
              {/* Back Glass Panel 1: Blurred Invitation */}
              <div 
                className="absolute w-[200px] h-[280px] md:w-[240px] md:h-[320px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] opacity-40 border border-white/20"
                style={{ transform: "translateZ(-80px) translateX(-60px) translateY(-20px) rotateZ(-12deg) scale(0.85)" }}
              >
                <img src="/images/editorial/venue_3.png" alt="Invite" className="w-full h-full object-cover blur-[4px]" />
              </div>

              {/* Back Glass Panel 2: Color Mood Board */}
              <div 
                className="absolute w-[220px] h-[300px] md:w-[260px] md:h-[340px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] opacity-60 border border-white/20"
                style={{ transform: "translateZ(-40px) translateX(60px) translateY(20px) rotateZ(-4deg) scale(0.9)" }}
              >
                <img src="/images/editorial/venue_2.png" alt="Moodboard" className="w-full h-full object-cover blur-[2px]" />
              </div>

              {/* MAIN WEDDING MEMORY CAPSULE */}
              <div 
                className="absolute w-[280px] h-[360px] md:w-[320px] md:h-[440px] rounded-[32px] bg-[#FAF7F2] shadow-[0_40px_80px_rgba(18,0,4,0.3),_inset_0_0_0_8px_#FAF7F2] border-[1px] border-[#E8C875]/20 overflow-hidden z-10"
                style={{ transform: "translateZ(40px)" }}
              >
                {/* Diagonal Glass Reflection */}
                <motion.div 
                  className="absolute inset-0 w-full h-[200%] bg-gradient-to-b from-transparent via-white/50 to-transparent transform -skew-y-[30deg] z-20 pointer-events-none mix-blend-overlay"
                  animate={{ y: ["-100%", "200%"] }}
                  transition={{ duration: 7, repeat: Infinity, ease: "linear", delay: 1 }}
                />
                
                <img src="/images/editorial/venue_1.png" alt="Memory" className="w-full h-full object-cover rounded-[24px]" />
              </div>

            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* SVG Horizon Wave Transition (Ivory Melting into Burgundy) */}
      <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-none z-0">
        
        {/* Soft Golden Horizon Glow */}
        <div className="absolute bottom-[20%] left-0 w-full h-[150px] bg-gradient-to-t from-[#C89B3C]/30 to-transparent blur-3xl mix-blend-overlay pointer-events-none" />
        
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-[100px] md:h-[160px]"
          style={{ filter: "drop-shadow(0px -15px 25px rgba(200,155,60,0.15))" }}
        >
          <path 
            d="M0,0 C300,120 900,-60 1200,60 L1200,120 L0,120 Z" 
            fill="#120004"
          />
        </svg>
      </div>

    </section>
  );
}
