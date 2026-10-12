import type { Config } from "tailwindcss";
import { colors, radius, shadows, spacing, breakpoints, typography } from "@we-arrange/design-system";

export const sharedTailwindConfig: Partial<Config> = {
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

export default sharedTailwindConfig;
