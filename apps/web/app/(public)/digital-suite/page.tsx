import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Digital Suite — Bespoke Wedding Websites & E-Invites",
  description: "Create your bespoke digital wedding presence with luxury wedding websites and animated digital invitations.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/digital-suite",
  },
};

export default function DigitalSuitePage() {
  return (
    <ComingSoon
      title="Digital Suite"
      description="The We Arrange Digital Suite for wedding websites and elegant e-invites is launching soon. Create your bespoke digital presence with us."
      returnTo="/"
      returnLabel="Return to Home"
    />
  );
}
