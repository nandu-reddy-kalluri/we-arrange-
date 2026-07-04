"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useSpring, useTransform, MotionValue } from "framer-motion";

export interface HeroMotionValues {
  mounted: boolean;
  isReducedMotion: boolean;
  /** Image layer — fastest, feels closest to viewer */
  imageX: MotionValue<number>;
  imageY: MotionValue<number>;
  /** Lighting layer — slower, feels further back */
  lightX: MotionValue<number>;
  lightY: MotionValue<number>;
}

export function useHeroMotion(): HeroMotionValues {
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 200 });

  // 6A+6B: Two planes at different speeds
  // Image layer  → [-8, 8] / [-6, 6]  — fastest (closest)
  const imageX = useTransform(smoothX, [-0.5, 0.5], [-8, 8]);
  const imageY = useTransform(smoothY, [-0.5, 0.5], [-6, 6]);

  // Lighting layer → [-3, 3] / [-2, 2] — slower (further back)
  const lightX = useTransform(smoothX, [-0.5, 0.5], [-3, 3]);
  const lightY = useTransform(smoothY, [-0.5, 0.5], [-2, 2]);

  useEffect(() => {
    setMounted(true);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mq.matches);
    const onMqChange = (e: MediaQueryListEvent) => setIsReducedMotion(e.matches);
    mq.addEventListener("change", onMqChange);

    const handlePointerMove = (e: PointerEvent) => {
      if (mq.matches) return;
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      mq.removeEventListener("change", onMqChange);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [mouseX, mouseY]);

  return { mounted, isReducedMotion, imageX, imageY, lightX, lightY };
}
