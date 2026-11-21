import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guest List and RSVP Management Tool",
  description: "Track wedding guests, family groups, meal preferences, and RSVP confirmations in one intuitive dashboard.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/guests",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function GuestsPage() {
  return (
    <ComingSoon
      title="Guest List Manager"
      description="Your personalized guest list manager is currently under development. Soon you'll be able to organize RSVPs, seating, and accommodations all in one place."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
