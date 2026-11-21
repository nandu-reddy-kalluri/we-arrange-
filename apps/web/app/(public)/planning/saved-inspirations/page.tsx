import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Wedding Inspirations and Moodboard",
  description: "Review your bookmarked wedding decor, bridal fashion, mandap concepts, and photography styles.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/saved-inspirations",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function SavedInspirationsPage() {
  return (
    <ComingSoon
      title="Saved Inspirations"
      description="Your moodboard of saved ideas, themes, and wedding styles is almost ready. Come back soon to view your collections."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
