/**
 * motion.ts
 * Semantic design tokens for animations and transitions.
 */
export const motionTokens = {
  hoverLift: "hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ease-out",
  springTransition: "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
  pageEntrance: "animate-fade-in-up",
  fade: "transition-opacity duration-300 ease-in-out",
  groupHoverZoom: "group-hover:scale-105 transition-transform duration-700 ease-out",
};
