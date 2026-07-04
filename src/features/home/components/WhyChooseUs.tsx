"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSearch, Sparkles, Scale, Compass } from "lucide-react";
import { typography, spacing, colors, radii, layout, grid } from "@/styles";

// Micro stories sub-components
function QuotesStory({ hovered }: { hovered: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Request</span>
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ delay: i * 0.18, duration: 0.25 }}
            className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm"
          >
            ✓
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ConciergeStory({ hovered }: { hovered: boolean }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Online</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={hovered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="bg-primary text-white px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm max-w-[170px] relative text-left"
      >
        "Hi, I'll help you compare venues."
        <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rotate-45" />
      </motion.div>
    </div>
  );
}

function CompareStory({ hovered }: { hovered: boolean }) {
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="px-2.5 py-1 bg-white border border-neutral-border rounded text-[9px] font-bold text-gray-400">
        Option A
      </div>
      <span className="text-gray-300 text-[10px] font-black">vs</span>
      <div className="px-2.5 py-1 bg-white border border-neutral-border rounded text-[9px] font-bold text-gray-400">
        Option B
      </div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={hovered ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="ml-auto px-2.5 py-1 rounded-full bg-accent-gold/15 text-primary border border-accent-gold/40 text-[9px] font-black uppercase tracking-wider"
      >
        Best Choice
      </motion.div>
    </div>
  );
}

function ExpertsStory({ hovered }: { hovered: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Hyderabad Hubs</span>
      <div className="flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ y: -6, opacity: 0 }}
            animate={hovered ? { y: 0, opacity: 1 } : { y: -6, opacity: 0 }}
            transition={{ delay: i * 0.18, duration: 0.25 }}
            className="text-base"
          >
            📍
          </motion.span>
        ))}
      </div>
    </div>
  );
}

interface CardProps {
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  children: (hovered: boolean) => React.ReactNode;
}

function WhyChooseCard({ title, desc, icon: Icon, children }: CardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTapped, setIsTapped] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    // Calculate tilt angles relative to center (-1 to 1)
    const x = (e.clientX - rect.left - width / 2) / (width / 2);
    const y = (e.clientY - rect.top - height / 2) / (height / 2);
    
    setMousePos({ x, y });
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = () => {
    setIsTapped(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsTapped(false), 300);
  };

  // 3D Tilt calculation (cap at 3 degrees, desktop only)
  const rotateX = isHovered ? mousePos.y * -3 : 0;
  const rotateY = isHovered ? mousePos.x * 3 : 0;

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      animate={{
        rotateX,
        rotateY,
        scale: isTapped ? 1.03 : 1.0,
        boxShadow: isHovered 
          ? "0 20px 40px rgba(0,0,0,0.08)" 
          : isTapped 
          ? "0 10px 30px rgba(197,168,128,0.2)" 
          : "0 4px 20px rgba(0,0,0,0.04)",
        borderColor: isHovered ? "#C5A880" : "#EAE6DE",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${colors.bgSecondary} border ${radii.card} p-5 lg:p-8 text-left flex flex-col justify-start hover:shadow-2xl transition-colors duration-300 relative overflow-hidden h-full min-h-[220px] lg:min-h-[260px] select-none`}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
    >
      {/* 2. Spotlight gradient overlay (Desktop only, 5%-8% opacity) */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-10 hidden md:block"
          style={{
            background: `radial-gradient(140px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(197,168,128,0.07) 0%, transparent 80%)`
          }}
        />
      )}

      {/* 3. Staggered inner content */}
      <div className="flex flex-col gap-3 lg:gap-4 z-20">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
        </div>
        
        <h3 className="font-serif font-bold text-[20px] lg:text-lg text-neutral-charcoal leading-snug tracking-tight">
          {title}
        </h3>
        <p className="text-[14px] lg:text-[12px] font-semibold text-neutral-muted leading-relaxed line-clamp-3 lg:line-clamp-none">
          {desc}
        </p>
      </div>

      {/* 4. Micro story layout */}
      <div className="hidden lg:flex h-14 w-full items-center justify-start z-20 relative overflow-hidden border-t border-neutral-border/40 pt-3 mt-auto">
        {children(isHovered)}
      </div>
    </motion.div>
  );
}

export default function WhyChooseUs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08, // 80ms stagger
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="why-choose-us" className={`${spacing.section} pb-28 lg:pb-20 ${colors.bgPrimary} relative overflow-hidden border-b ${colors.borderLight}`}>
      <div className={`${layout.maxWidth} ${spacing.container}`}>
        
        {/* Header Block */}
        <div className="text-center mb-16 flex flex-col items-center gap-3">
          <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em]">
            PLAN • Why Couples Choose Us
          </span>
          <h2 className={typography.sectionTitle}>
            A Simpler Way to Plan Your Big Day
          </h2>
          <div className="w-14 h-[2px] bg-gradient-to-r from-accent-gold to-primary mt-2" />
        </div>

        {/* Staggered domino cards reveal */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 items-stretch"
        >
          <motion.div variants={itemVariants} className="h-full">
            <WhyChooseCard
              title="We Collect Quotes For You"
              desc="No catalog scrolling. Our team reaches out directly to gather multiple tailored estimates and packages."
              icon={FileSearch}
            >
              {(hovered) => <QuotesStory hovered={hovered} />}
            </WhyChooseCard>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <WhyChooseCard
              title="Personal Wedding Concierge"
              desc="Work with a dedicated coordinator who manages date screenings, negotiations, and calls."
              icon={Sparkles}
            >
              {(hovered) => <ConciergeStory hovered={hovered} />}
            </WhyChooseCard>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <WhyChooseCard
              title="Compare Options Clearly"
              desc="Review side-by-side matrices comparing base costs, restrictions, and features in one sheet."
              icon={Scale}
            >
              {(hovered) => <CompareStory hovered={hovered} />}
            </WhyChooseCard>
          </motion.div>

          <motion.div variants={itemVariants} className="h-full">
            <WhyChooseCard
              title="Hyderabad Wedding Experts"
              desc="We focus 100% on Hyderabad venues, decorators, and caterers, bringing unmatched local insider access."
              icon={Compass}
            >
              {(hovered) => <ExpertsStory hovered={hovered} />}
            </WhyChooseCard>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}
