"use client";

import React from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sparkles, Search, SlidersHorizontal, Heart } from "lucide-react";

export function ConciergeJourney() {
  // 3D Parallax Mouse Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX = event.clientX - rect.left;
    const clientY = event.clientY - rect.top;
    x.set(clientX - rect.width / 2);
    y.set(clientY - rect.height / 2);
  };

  // Transforms: Parallax layering
  // Stage (slight rotation)
  const rotateX = useTransform(y, [-500, 500], [6, -6]);
  const rotateY = useTransform(x, [-500, 500], [-6, 6]);
  
  // Orb moves slow
  const orbX = useTransform(x, [-500, 500], [-10, 10]);
  const orbY = useTransform(y, [-500, 500], [-10, 10]);
  
  // Cards move opposite (parallax effect)
  const cardX = useTransform(x, [-500, 500], [15, -15]);
  const cardY = useTransform(y, [-500, 500], [15, -15]);

  return (
    <section className="relative w-full bg-[#FAF7F2] overflow-hidden lg:h-[700px] flex flex-col pt-16 pb-12 lg:py-16">
      
      {/* Background Decorators */}
      <div className="absolute inset-0 bg-[url('/images/noise.png')] opacity-[0.03] pointer-events-none mix-blend-overlay z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(200,161,101,0.12)_0%,rgba(255,255,255,0)_70%)] rounded-full pointer-events-none blur-3xl z-0" />
      
      {/* Faint Wedding Ring Outline (CSS) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[0.5px] border-[#C8A165]/10 rounded-full z-0 opacity-50" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] border-[0.5px] border-[#C8A165]/5 rounded-full z-0 opacity-30" />

      {/* Warm Spotlight */}
      <motion.div animate={{ opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[#E8C97A]/20 rounded-full blur-[100px] z-0" />

      {/* SECTION HEADER */}
      <div className="relative z-10 w-full text-center px-4 mb-4 lg:mb-8">
        <span className="font-sans text-[10px] sm:text-xs font-black uppercase text-[#C8A165] tracking-[0.25em] block mb-3">
          LUXURY WEDDING EXPERIENCE
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-[44px] font-serif tracking-tight text-neutral-charcoal leading-[1.1] mb-3">
          From Vision to Celebration
        </h2>
        <p className="font-sans text-[14px] md:text-base text-neutral-500 font-medium">
          Share once. <span className="italic text-[#C8A165]">Discover better choices.</span>
        </p>
      </div>

      {/* 3D INTERACTIVE CIRCULAR STAGE */}
      <div 
        className="relative z-20 w-full flex-grow flex items-center justify-center perspective-[1200px]"
        onMouseMove={handleMouseMove}
      >
        <motion.div 
          className="relative w-[340px] h-[340px] md:w-[500px] md:h-[500px] flex items-center justify-center transform-style-preserve-3d"
          style={{ rotateX, rotateY }}
        >
          
          {/* ORBIT RINGS & PARTICLES */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            {/* Ring 1 */}
            <motion.div 
              animate={{ rotateZ: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] border border-[#C8A165]/30 rounded-full"
            >
              <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-[#C8A165] rounded-full shadow-[0_0_10px_#C8A165]" />
            </motion.div>
            
            {/* Ring 2 */}
            <motion.div 
              animate={{ rotateZ: -360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="absolute w-[320px] h-[320px] md:w-[460px] md:h-[460px] border border-[#C8A165]/15 rounded-full"
            >
              <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-white rounded-full shadow-[0_0_15px_#ffffff]" />
            </motion.div>
          </div>

          {/* UNDERSTANDING ANIMATION (SVG Particles) */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-visible">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 500">
              <defs>
                <radialGradient id="glowPulse">
                  <stop offset="0%" stopColor="#C8A165" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>

              {/* 1. Top Card to Orb */}
              <motion.circle 
                cx="250" cy="50" r="3" fill="#C8A165"
                animate={{ cy: [50, 250], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeIn", delay: 0 }}
                style={{ filter: 'drop-shadow(0px 0px 4px #C8A165)' }}
              />

              {/* 2. Orb to Left Card */}
              <motion.circle 
                cx="250" cy="250" r="3" fill="#C8A165"
                animate={{ cx: [250, 50], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 2 }}
                style={{ filter: 'drop-shadow(0px 0px 4px #C8A165)' }}
              />

              {/* 3. Orb to Right Card */}
              <motion.circle 
                cx="250" cy="250" r="3" fill="#C8A165"
                animate={{ cx: [250, 450], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 2.2 }}
                style={{ filter: 'drop-shadow(0px 0px 4px #C8A165)' }}
              />

              {/* 4. Orb to Bottom Card */}
              <motion.circle 
                cx="250" cy="250" r="3" fill="#C8A165"
                animate={{ cy: [250, 450], opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 2.4 }}
                style={{ filter: 'drop-shadow(0px 0px 4px #C8A165)' }}
              />
            </svg>
          </div>

          {/* CENTER ORB: We Arrange Platform */}
          <motion.div 
            style={{ x: orbX, y: orbY }}
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 20px 50px rgba(28,0,6,0.3)", "0 20px 70px rgba(200,161,101,0.2)", "0 20px 50px rgba(28,0,6,0.3)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute z-20 w-36 h-36 md:w-44 md:h-44 rounded-full bg-gradient-to-br from-[#2E0B14] via-[#1C0006] to-[#0A0002] border border-[#C8A165]/50 flex flex-col items-center justify-center backdrop-blur-2xl"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_top,rgba(200,161,101,0.25),transparent_70%)]" />
            <div className="absolute top-2 w-[80%] h-[30%] bg-white/5 rounded-full blur-[2px] opacity-50" />
            
            <span className="font-serif text-3xl md:text-4xl font-bold text-white leading-none mb-1 drop-shadow-md text-center">We<br/>Arrange</span>
            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-bold text-[#C8A165]">Platform</span>
          </motion.div>

          {/* CIRCULAR JOURNEY CARDS */}
          {/* Top Card: Share Vision */}
          <motion.div 
            style={{ x: cardX, y: cardY, translateZ: 20 }}
            whileHover={{ scale: 1.05, translateZ: 40 }}
            className="group absolute z-30 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/70 backdrop-blur-xl border border-[#E8C97A]/40 hover:border-[#C8A165] hover:shadow-[0_0_30px_rgba(200,161,101,0.2)] shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-[32px] p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 w-[120px] md:w-[140px]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF7F2] border border-[#E8C97A]/30 flex items-center justify-center shadow-sm group-hover:bg-[#6F1D2C] group-hover:text-white transition-colors duration-300">
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6F1D2C] group-hover:text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-neutral-800 text-center">01<br/>Share Vision</span>
            <span className="text-[9px] md:text-[10px] text-neutral-500 font-medium">Tell us once</span>
          </motion.div>

          {/* Left Card: Discover */}
          <motion.div 
            style={{ x: cardX, y: cardY, translateZ: 20 }}
            whileHover={{ scale: 1.05, translateZ: 40 }}
            className="group absolute z-30 left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-[20%] bg-white/70 backdrop-blur-xl border border-[#E8C97A]/40 hover:border-[#C8A165] hover:shadow-[0_0_30px_rgba(200,161,101,0.2)] shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-[32px] p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 w-[120px] md:w-[140px]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF7F2] border border-[#E8C97A]/30 flex items-center justify-center shadow-sm group-hover:bg-[#6F1D2C] group-hover:text-white transition-colors duration-300">
              <Search className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6F1D2C] group-hover:text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-neutral-800 text-center">02<br/>Discover</span>
            <span className="text-[9px] md:text-[10px] text-neutral-500 font-medium">We find choices</span>
          </motion.div>

          {/* Right Card: Compare */}
          <motion.div 
            style={{ x: cardX, y: cardY, translateZ: 20 }}
            whileHover={{ scale: 1.05, translateZ: 40 }}
            className="group absolute z-30 right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-[20%] bg-white/70 backdrop-blur-xl border border-[#E8C97A]/40 hover:border-[#C8A165] hover:shadow-[0_0_30px_rgba(200,161,101,0.2)] shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-[32px] p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 w-[120px] md:w-[140px]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF7F2] border border-[#E8C97A]/30 flex items-center justify-center shadow-sm group-hover:bg-[#6F1D2C] group-hover:text-white transition-colors duration-300">
              <SlidersHorizontal className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6F1D2C] group-hover:text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-neutral-800 text-center">03<br/>Compare</span>
            <span className="text-[9px] md:text-[10px] text-neutral-500 font-medium">Review easily</span>
          </motion.div>

          {/* Bottom Card: Choose */}
          <motion.div 
            style={{ x: cardX, y: cardY, translateZ: 20 }}
            whileHover={{ scale: 1.05, translateZ: 40 }}
            className="group absolute z-30 bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-white/70 backdrop-blur-xl border border-[#E8C97A]/40 hover:border-[#C8A165] hover:shadow-[0_0_30px_rgba(200,161,101,0.2)] shadow-[0_12px_32px_rgba(0,0,0,0.06)] rounded-[32px] p-3 md:p-4 flex flex-col items-center gap-1.5 md:gap-2 transition-all duration-300 w-[120px] md:w-[140px]"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#FAF7F2] border border-[#E8C97A]/30 flex items-center justify-center shadow-sm group-hover:bg-[#6F1D2C] group-hover:text-white transition-colors duration-300">
              <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#6F1D2C] group-hover:text-white" />
            </div>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-wider text-neutral-800 text-center">04<br/>Choose</span>
            <span className="text-[9px] md:text-[10px] text-neutral-500 font-medium">Finalize your plan</span>
          </motion.div>

        </motion.div>
      </div>

      {/* CONTINUOUS BOTTOM PROGRESS LINE */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 mt-8 md:mt-0 lg:mt-4 hidden md:block">
        <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8C97A]/30 to-transparent flex items-center justify-between">
          
          {/* Traveling Golden Dot */}
          <motion.div 
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C8A165] rounded-full shadow-[0_0_10px_#C8A165] z-10"
          />

          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-[#C8A165] bg-[#FAF7F2] px-2 z-20">Share Vision</span>
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-neutral-400 bg-[#FAF7F2] px-2 z-20">Discover</span>
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-neutral-400 bg-[#FAF7F2] px-2 z-20">Compare</span>
          <span className="text-[9px] md:text-[10px] uppercase font-bold tracking-widest text-[#6F1D2C] bg-[#FAF7F2] px-2 z-20">Choose</span>
        </div>
      </div>

    </section>
  );
}
