/**
 * Shadow Tokens
 * Centralizes drop-shadows and inner glows to guarantee 
 * uniform elevation across all components.
 */
export const shadows = {
  // Ambient drop shadows for resting states
  ambient: "shadow-[0_15px_45px_-10px_rgba(0,0,0,0.04)]",
  ambientGold: "shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_30px_rgba(197,168,128,0.08)]",
  
  // Hover states for the 2px lift effect
  hover: "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)]",
  hoverGold: "shadow-[0_25px_70px_-12px_rgba(0,0,0,0.08),0_0_40px_rgba(197,168,128,0.12)]",
  
  // Inner highlights to simulate physical material/glass depth
  innerGlass: "shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),inset_0_-1px_1px_rgba(0,0,0,0.02)]",
  innerGold: "shadow-[inset_0_0_0_1px_rgba(197,168,128,0.2)]",
  innerGoldHover: "shadow-[inset_0_0_0_1px_rgba(197,168,128,0.4)]",
};
