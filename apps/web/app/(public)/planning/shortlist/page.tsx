import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shortlisted Wedding Venues and Vendors",
  description: "Compare your favorite Hyderabad wedding venues and verified vendors side by side with pricing estimates.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/shortlist",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ShortlistPage() {
  return (
    <ComingSoon
      title="Your Shortlist"
      description="Manage all your saved venues, vendors, and inspiration in one refined space. This feature is being finalized."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
