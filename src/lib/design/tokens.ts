/**
 * Global Design Tokens for YouMarriageWeArrange
 * Replacing all hardcoded values to ensure a cohesive luxury experience.
 */

export const tokens = {
  spacing: {
    section: "py-24 md:py-32",
    container: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    cardPadding: "p-6 sm:p-8 md:p-10",
    elementGap: "gap-6 md:gap-8",
  },
  borderRadius: {
    card: "rounded-[28px]",
    image: "rounded-[20px]",
    button: "rounded-full",
    pill: "rounded-full",
  },
  shadows: {
    luxuryAmbient: "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_30px_rgba(197,168,128,0.08)]",
    luxuryHover: "shadow-[0_25px_70px_-12px_rgba(0,0,0,0.08),0_0_40px_rgba(197,168,128,0.12)]",
    softElevate: "shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)]",
    innerGlow: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)]",
  },
  typography: {
    hero: "font-serif text-[44px] md:text-[64px] lg:text-[80px] font-bold leading-[1.05] tracking-tight",
    h2: "font-serif text-[32px] md:text-[48px] font-bold leading-[1.1] tracking-tight",
    h3: "font-serif text-[24px] md:text-[28px] font-bold leading-tight",
    bodyLarge: "font-sans text-[17px] md:text-[19px] leading-[170%] text-[#6D6D6D] font-medium",
    body: "font-sans text-[15px] leading-[170%] text-[#6D6D6D] font-medium",
    label: "font-sans text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em]",
  },
  animation: {
    timing: {
      fast: 0.15,
      normal: 0.3,
      slow: 0.6,
      cinematic: 1.2,
    },
    spring: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      mass: 0.8,
    }
  },
  materials: {
    glassIvory: "bg-[#FBF9F6]/90 backdrop-blur-md",
    paperOverlay: "bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-30 mix-blend-multiply pointer-events-none",
    silkOverlay: "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay pointer-events-none",
  }
};
