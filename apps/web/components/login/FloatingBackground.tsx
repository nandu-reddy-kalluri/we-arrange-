"use client";

import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export const FloatingBackground: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Generate deterministic luxury ambient floating particles
    const generated: Particle[] = Array.from({ length: 22 }, (_, i) => ({
      id: i,
      x: (i * 17 + 5) % 100, // percentage x
      y: (i * 23 + 12) % 100, // percentage y
      size: (i % 3) * 2 + 2, // 2px to 6px
      duration: 12 + (i % 5) * 4, // 12s to 28s
      delay: (i % 7) * 1.2,
      opacity: 0.2 + (i % 4) * 0.15, // 0.2 to 0.65
    }));
    setParticles(generated);

    const handleMouseMove = (e: MouseEvent) => {
      if (shouldReduceMotion) return;
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      // Calculate normalized mouse coords from -1 to 1
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [shouldReduceMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#121112]">
      {/* Dynamic Base Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#1C1A1A_0%,#121112_60%,#0A0A0A_100%)] transition-colors duration-700" />

      {/* Animated Mesh Gradient Blobs (Subdued cinematic glow) */}
      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 20, -10, 0],
                y: [0, -15, 15, 0],
                scale: [1, 1.05, 0.95, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transform: `translate3d(${mousePosition.x * 25}px, ${
            mousePosition.y * 25
          }px, 0)`,
        }}
        className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-[#8B263E]/5 via-[#C5A880]/5 to-transparent blur-[120px]"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, -25, 15, 0],
                y: [0, 20, -20, 0],
                scale: [1, 1.1, 0.95, 1],
              }
        }
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transform: `translate3d(${mousePosition.x * -35}px, ${
            mousePosition.y * -35
          }px, 0)`,
        }}
        className="absolute -bottom-40 -right-20 w-[650px] h-[650px] rounded-full bg-gradient-to-tl from-[#C5A880]/10 via-[#8B263E]/5 to-transparent blur-[140px]"
      />

      <motion.div
        animate={
          shouldReduceMotion
            ? {}
            : {
                x: [0, 15, -15, 0],
                y: [0, -20, 10, 0],
                scale: [0.95, 1.05, 0.95, 0.95],
              }
        }
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          transform: `translate3d(${mousePosition.x * 15}px, ${
            mousePosition.y * 15
          }px, 0)`,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#2D2A2B]/10 via-transparent to-transparent blur-[100px]"
      />

      {/* Luxury Golden Ambient Particles */}
      {!shouldReduceMotion &&
        particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0 }}
            animate={{
              opacity: [0, p.opacity, 0],
              y: [-20, -120],
              x: [0, (p.id % 2 === 0 ? 1 : -1) * 30],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              transform: `translate3d(${mousePosition.x * (p.size * 5)}px, ${
                mousePosition.y * (p.size * 5)
              }px, 0)`,
            }}
            className="absolute rounded-full bg-gradient-to-r from-[#C5A880] to-[#E6D4B8] shadow-[0_0_8px_rgba(197,168,128,0.8)]"
          />
        ))}

      {/* Delicate Luxury Micro-Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(197,168,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(197,168,128,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
    </div>
  );
};

export default FloatingBackground;
