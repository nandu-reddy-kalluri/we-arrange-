/**
 * Global Theme Palette & Gradients
 */

export const theme = {
  colors: {
    primary: "#8B263E", // Deep Burgundy (Hero / Action)
    primaryHover: "#6e1c2f",
    accent: {
      gold: "#C5A880", // Champagne Gold (Accents / Borders)
      goldLight: "rgba(197, 168, 128, 0.2)",
    },
    background: {
      ivory: "#FBF9F6", // Primary App Background
      cream: "#F5F2EB", // Secondary Background / Pills
      white: "#FFFFFF",
    },
    text: {
      charcoal: "#2D2D2D", // Primary Headings
      muted: "#6D6D6D", // Body text
      light: "#A0A0A0",
    }
  },
  gradients: {
    heroAtmosphere: "bg-gradient-to-br from-[#FBF9F6] via-[#F5F2EB] to-[#EAE3D4]",
    goldShine: "bg-gradient-to-tr from-transparent via-[#C5A880]/20 to-transparent",
    sectionFade: "bg-gradient-to-b from-transparent via-[#FBF9F6] to-[#F5F2EB]",
  }
};
