import type { Config } from "tailwindcss";
import { colors, radius, shadows, spacing, breakpoints } from "./src/design-system/theme";

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
        // Map YMWA color design tokens
        primary: {
          DEFAULT: colors.primary.DEFAULT,
          light: colors.primary.light,
          dark: colors.primary.dark,
        },
        accent: {
          gold: colors.accent.gold,
          goldDark: colors.accent.goldDark,
          goldLight: colors.accent.goldLight,
        },
        neutral: {
          cream: colors.neutral.cream,
          charcoal: colors.neutral.charcoal,
          muted: colors.neutral.muted,
          border: colors.neutral.border,
        },
      },
      borderRadius: {
        // Map YMWA border radius design tokens
        sm: radius.sm,
        md: radius.md,
        lg: radius.lg,
        xl: radius.xl,
        xxl: radius.xxl,
      },
      boxShadow: {
        // Map YMWA shadow design tokens
        sm: shadows.sm,
        md: shadows.md,
        lg: shadows.lg,
        glass: shadows.glass,
        premium: shadows.premium,
      },
      spacing: {
        // Map YMWA spacing design tokens
        xs: spacing.xs,
        sm: spacing.sm,
        md: spacing.md,
        lg: spacing.lg,
        xl: spacing.xl,
        xxl: spacing.xxl,
        section: spacing.section,
      },
      screens: {
        // Map YMWA responsive screens/breakpoints
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
        xxl: breakpoints.xxl,
      },
      fontFamily: {
        // Map YMWA font families
        serif: ["var(--font-serif)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
