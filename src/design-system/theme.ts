// Centralized visual design system tokens for We Arrange

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  xxl: "1536px",
};

export const colors = {
  primary: {
    DEFAULT: "#8B263E",
    light: "hsl(346, 55%, 45%)",
    dark: "hsl(346, 60%, 25%)",
  },
  accent: {
    gold: "#C5A880",
    goldDark: "#9E8158",
    goldLight: "#F0E7DB",
  },
  surface: {
    canvas: "#FAF9F6",
    DEFAULT: "#FFFFFF",
    hover: "#F5F4F0",
  },
  text: {
    main: "#2D2D2D",
    muted: "#6D6D6D",
  },
  border: {
    subtle: "#EAEAEA",
    strong: "#D1D1D1",
  },
  status: {
    success: "#2E5E4E",
    warning: "#C9943B",
    error: "#B33A3A",
  }
};

export const radius = {
  none: "0px",
  sm: "0.125rem",     // 2px
  md: "0.375rem",     // 6px
  lg: "0.75rem",      // 12px
  xl: "1.25rem",      // 20px
  full: "9999px",
};

export const shadows = {
  sm: "0 2px 4px rgba(45, 45, 45, 0.04)",
  md: "0 4px 12px rgba(45, 45, 45, 0.06)",
  lg: "0 12px 32px rgba(45, 45, 45, 0.08)",
  glass: "0 8px 32px rgba(197, 168, 128, 0.12)",
};

export const spacing = {
  1: "0.25rem",     // 4px
  2: "0.5rem",      // 8px
  3: "0.75rem",     // 12px
  4: "1rem",        // 16px
  6: "1.5rem",      // 24px
  8: "2rem",        // 32px
  12: "3rem",       // 48px
  16: "4rem",       // 64px
  24: "6rem",       // 96px
};

export const typography = {
  fonts: {
    serif: "var(--font-serif), Playfair Display, Georgia, serif",
    sans: "var(--font-sans), Plus Jakarta Sans, Inter, system-ui, sans-serif",
  },
  sizes: {
    caption: "0.75rem",  // 12px
    bodySm: "0.875rem",  // 14px
    body: "1rem",        // 16px
    h4: "1.125rem",      // 18px
    h3: "1.5rem",        // 24px
    h2: "2rem",          // 32px
    h1: "3rem",          // 48px
    display: "4rem",     // 64px
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
