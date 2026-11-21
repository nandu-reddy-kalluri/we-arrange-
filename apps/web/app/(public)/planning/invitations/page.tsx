import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Invitation Tracker and Distribution",
  description: "Manage print and digital invitation dispatch, delivery status, and responses effortlessly.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/invitations",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function InvitationsPage() {
  return (
    <ComingSoon
      title="Digital Invitations"
      description="Exclusive, premium digital invitations and save-the-dates are coming soon to We Arrange. Stay tuned."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
