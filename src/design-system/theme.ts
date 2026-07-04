// Centralized visual design system tokens for YouMarriageWeArrange (YMWA)

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

export const colors = {
  primary: {
    DEFAULT: "#8B263E",               // Deep Crimson Burgundy (Buttons, steps, key badges)
    light: "hsl(346, 55%, 45%)",       // Light Crimson
    dark: "hsl(346, 60%, 25%)",        // Dark Burgundy
  },
  accent: {
    gold: "#C5A880",                  // Elegant Luxury Gold
    goldDark: "#9E8158",              // Shadow gold
    goldLight: "#F0E7DB",             // Cream gold dust
  },
  neutral: {
    white: "#FFFFFF",
    cream: "#FAF9F6",                 // Silk Ivory (Soft background, footer, sliders)
    charcoal: "#2D2D2D",              // Main Text color
    muted: "#6D6D6D",                 // Subtitles & descriptions
    border: "#EAEAEA",                // Muted grid borders
  }
};

export const radius = {
  sm: "0.125rem",     // 2px
  md: "0.375rem",     // 6px
  lg: "0.5rem",       // 8px
  xl: "0.75rem",      // 12px
  xxl: "1.25rem",     // 20px (Luxury smooth rounded cards)
  full: "9999px",
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
  glass: "0 8px 32px 0 rgba(25, 45, 50, 0.04)", // Light premium glass
  premium: "0 20px 50px -12px rgba(340, 60, 15, 0.06)", // Wine-tinted luxury glow
};

export const spacing = {
  xs: "0.25rem",     // 4px
  sm: "0.5rem",      // 8px
  md: "1rem",        // 16px
  lg: "1.5rem",      // 24px
  xl: "2rem",        // 32px
  xxl: "3rem",       // 48px
  section: "5rem",   // 80px (Standard section offset)
};

export const typography = {
  fonts: {
    serif: "var(--font-serif), Playfair Display, Georgia, serif",
    sans: "var(--font-sans), Plus Jakarta Sans, Inter, system-ui, sans-serif",
  },
  sizes: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    h3: "1.5rem",     // 24px
    h2: "2rem",       // 32px
    h1: "2.5rem",     // 40px
    display: "3.5rem",// 56px
  },
  weights: {
    light: "300",
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  }
};

export const theme = {
  breakpoints,
  colors,
  radius,
  shadows,
  spacing,
  typography,
};
