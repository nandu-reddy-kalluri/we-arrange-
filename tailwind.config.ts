import type { Config } from "tailwindcss";
import { colors, radius, shadows, spacing, breakpoints, typography } from "./src/design-system/theme";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: colors.primary,
        accent: colors.accent,
        surface: colors.surface,
        text: colors.text,
        border: colors.border,
        status: colors.status,
        // Backward compatibility for existing components
        neutral: {
          cream: colors.surface.canvas,
          charcoal: colors.text.main,
          muted: colors.text.muted,
          border: colors.border.subtle,
        },
      },
      borderRadius: radius,
      boxShadow: shadows,
      spacing: spacing,
      screens: breakpoints,
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: typography.sizes,
      fontWeight: typography.weights,
    },
  },
  plugins: [],
};
export default config;
