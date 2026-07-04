/**
 * Global Motion System for YouMarriageWeArrange
 * Adheres to the strict Performance Budget and Motion Hierarchy rules.
 */
import { Variants } from "framer-motion";

// ----------------------------------------------------------------------
// ★★★★★ HERO & SECTION REVEALS
// Reserved for major narrative shifts and the homepage hero.
// ----------------------------------------------------------------------
export const cinematicReveal: Variants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } 
  },
};

export const sectionEnter: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut", staggerChildren: 0.15 } 
  },
};

// ----------------------------------------------------------------------
// ★★★★ CARDS & NAVIGATION
// Fluid, spring-based micro-interactions that feel alive but restrained.
// ----------------------------------------------------------------------
export const luxuryCardHover = {
  rest: { y: 0, scale: 1 },
  hover: { 
    y: -2, 
    scale: 1.01,
    transition: { type: "spring", stiffness: 400, damping: 30 } 
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 350, damping: 30 } 
  },
};

// ----------------------------------------------------------------------
// ★★★ BUTTONS & CTAs
// ----------------------------------------------------------------------
export const ctaHover = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 25 } 
  },
  tap: { scale: 0.98 }
};

// ----------------------------------------------------------------------
// ★★ ICONS & MICRO-INTERACTIONS
// ----------------------------------------------------------------------
export const iconReveal: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { 
    opacity: 1, 
    scale: 1, 
    transition: { type: "spring", stiffness: 300, damping: 20 } 
  }
};
