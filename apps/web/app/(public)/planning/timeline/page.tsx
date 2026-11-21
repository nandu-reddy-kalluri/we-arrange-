import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Day-of Wedding Timeline and Event Schedule",
  description: "Build detailed hour-by-hour schedules for your Mehendi, Sangeet, Muhurtham ceremony, and Reception.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/timeline",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function TimelinePage() {
  return (
    <ComingSoon
      title="Wedding Timeline"
      description="An interactive timeline to perfectly orchestrate your celebration events. This feature will be available shortly."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
