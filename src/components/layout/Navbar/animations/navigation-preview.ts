import { Variants } from "framer-motion";

export const previewCardTransition: Variants = {
  hidden: { 
    opacity: 0, 
    y: 12, 
    scale: 0.98,
    pointerEvents: "none"
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    pointerEvents: "auto",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 25, 
      mass: 0.8,
      duration: 0.22,
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  },
  exit: { 
    opacity: 0, 
    y: -6, // moves UP 6px on exit as requested
    scale: 1,
    pointerEvents: "none",
    transition: { 
      duration: 0.18, 
      ease: "easeOut",
      staggerChildren: 0.03,
      staggerDirection: -1
    }
  }
};

export const previewChildTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 30 }
  },
  exit: { opacity: 0, transition: { duration: 0.1 } }
};

export const previewImageFade: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.25, ease: "easeOut" } 
  },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};
