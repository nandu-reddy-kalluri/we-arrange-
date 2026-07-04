/**
 * Z-Index Tokens
 * Strict hierarchy to prevent overlapping layering bugs.
 */
export const zIndex = {
  behind: "z-[-1]",
  base: "z-0",
  content: "z-10",
  floating: "z-20", // Floating cards, tooltips
  header: "z-40",   // Navbar
  modal: "z-50",    // Full screen modals, drawers
  toast: "z-60",    // Notifications
};
