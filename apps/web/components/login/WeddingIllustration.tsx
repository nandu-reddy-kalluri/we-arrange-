"use client";

import React from "react";
import { motion } from "framer-motion";

export const WeddingIllustration: React.FC = () => {
  return (
    <div className="relative w-full max-w-lg mx-auto flex items-center justify-center p-4">
      {/* Outer Golden Ambient Glow Ring */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-[#C5A880]/30 via-[#8B263E]/20 to-[#C5A880]/30 blur-2xl pointer-events-none"
      />

      {/* SVG Luxury Floral & Arch Artwork */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl relative z-10 max-h-[420px]"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E6D4B8" />
            <stop offset="50%" stopColor="#C5A880" />
            <stop offset="100%" stopColor="#9E8158" />
          </linearGradient>

          <linearGradient id="burgundyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A8324E" />
            <stop offset="50%" stopColor="#8B263E" />
            <stop offset="100%" stopColor="#5E1627" />
          </linearGradient>

          <linearGradient id="roseGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F7EBE1" />
            <stop offset="50%" stopColor="#E6C8B5" />
            <stop offset="100%" stopColor="#C5A880" />
          </linearGradient>

          <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C5A880" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#C5A880" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Ring Glow */}
        <circle cx="250" cy="230" r="160" fill="url(#ringGlow)" />

        {/* Elegant Arch Structure */}
        <motion.path
          d="M 120 400 L 120 220 Q 120 100 250 100 Q 380 100 380 220 L 380 400"
          stroke="url(#goldGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d="M 135 400 L 135 225 Q 135 115 250 115 Q 365 115 365 225 L 365 400"
          stroke="url(#roseGold)"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1, duration: 1.5 }}
        />

        {/* Decorative Luxury Floral Vine Top Center */}
        <g transform="translate(250, 100)">
          {/* Central Flower Motif */}
          <circle cx="0" cy="0" r="14" fill="url(#burgundyGrad)" />
          <circle cx="0" cy="0" r="7" fill="url(#goldGrad)" />

          {/* Petals */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.path
              key={i}
              d="M 0 0 C -8 -15 0 -24 0 -30 C 0 -24 8 -15 0 0"
              fill="url(#goldGrad)"
              opacity="0.85"
              transform={`rotate(${i * 45})`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
            />
          ))}
        </g>

        {/* Interlocking Wedding Rings Badge */}
        <g transform="translate(250, 230)">
          {/* Left Ring (Bride) */}
          <motion.ellipse
            cx="-28"
            cy="0"
            rx="50"
            ry="45"
            stroke="url(#goldGrad)"
            strokeWidth="7"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          />

          {/* Right Ring (Groom) */}
          <motion.ellipse
            cx="28"
            cy="0"
            rx="50"
            ry="45"
            stroke="url(#roseGold)"
            strokeWidth="7"
            fill="none"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8 }}
          />

          {/* Diamond Solitaire Accent on Bride Ring */}
          <polygon
            points="-28,-50 -20,-62 -28,-72 -36,-62"
            fill="#FFFFFF"
            stroke="url(#goldGrad)"
            strokeWidth="1.5"
          />
          {/* Diamond Sparkle Ray */}
          <circle cx="-28" cy="-62" r="3" fill="#FFFFFF" />
        </g>

        {/* Romantic Bride & Groom Silhouette Monogram Emblem at Base */}
        <g transform="translate(250, 360)">
          {/* Base Pedestal line */}
          <path
            d="M -120 30 Q 0 45 120 30"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="0" cy="0" r="28" fill="url(#burgundyGrad)" stroke="url(#goldGrad)" strokeWidth="2" />
          <text
            x="0"
            y="7"
            textAnchor="middle"
            fill="url(#goldGrad)"
            fontSize="18"
            fontFamily="serif"
            fontWeight="bold"
            letterSpacing="2"
          >
            YMWA
          </text>
        </g>

        {/* Decorative Golden Leaves & Vines Left Side */}
        <g transform="translate(120, 250)">
          <path
            d="M 0 -80 C -30 -60 -40 -20 0 40"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="-25" cy="-40" r="5" fill="url(#burgundyGrad)" />
          <circle cx="-32" cy="0" r="6" fill="url(#goldGrad)" />
        </g>

        {/* Decorative Golden Leaves & Vines Right Side */}
        <g transform="translate(380, 250)">
          <path
            d="M 0 -80 C 30 -60 40 -20 0 40"
            stroke="url(#goldGrad)"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="25" cy="-40" r="5" fill="url(#burgundyGrad)" />
          <circle cx="32" cy="0" r="6" fill="url(#goldGrad)" />
        </g>

        {/* Floating Sparkle Stars */}
        <motion.path
          d="M 180 160 L 183 168 L 191 171 L 183 174 L 180 182 L 177 174 L 169 171 L 177 168 Z"
          fill="url(#goldGrad)"
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.path
          d="M 320 170 L 323 176 L 329 179 L 323 182 L 320 188 L 317 182 L 311 179 L 317 176 Z"
          fill="url(#roseGold)"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </svg>
    </div>
  );
};

export default WeddingIllustration;
