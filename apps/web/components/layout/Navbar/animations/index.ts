import { Variants } from "framer-motion";

export const panelTransition: Variants = {
  hidden: { opacity: 0, y: -20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: "spring", stiffness: 300, damping: 30,
    }
  },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.2 } }
};

export const ribbonReveal: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: { 
    opacity: 1, 
    x: "100%", 
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { opacity: 0, x: "100%", transition: { duration: 0 } }
};

// Orchestrates the staggered entrance for panel contents
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

export const childItemReveal: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } }
};

export const heroImageScale: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  visible: { 
    opacity: 1, 
    scale: 1.0, 
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};
