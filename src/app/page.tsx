import React from "react";
import HeroSection from "@/features/home/components/HeroSection";
import { ConciergeJourney } from "@/features/home/components/ConciergeJourney";
import VenueSection from "@/features/home/components/VenueSection";
import VendorSection from "@/features/home/components/VendorSection";

import { MobileQuickSearchChips } from "@/features/home/components/MobileQuickSearchChips";
import { TrustStrip } from "@/features/home/components/TrustStrip";
import { ClientScrollRail } from "@/components/layout/ClientScrollRail";
import { FloatingConciergeButton } from "@/components/layout/FloatingConciergeButton";
import DigitalSuiteSection from "@/features/home/components/DigitalSuiteSection";
import { CelebrateSection } from "@/features/home/components/CelebrateSection";

export const metadata = {
  title: "YouMarriageWeArrange | Hyderabad's Premium Wedding Concierge",
  description: "Submit your wedding requirements and let our experts curate and negotiate the perfect venue and vendors. A white-glove concierge service.",
  openGraph: {
    title: "YouMarriageWeArrange",
    description: "Hyderabad's Premium Wedding Concierge",
  }
};

export default function HomePage() {
  return (
    <main className="overflow-hidden relative bg-neutral-cream">
      <ClientScrollRail />
      
      <div id="hero">
        <HeroSection />
      </div>

      <TrustStrip />
      <MobileQuickSearchChips />
      
      <div id="concierge-journey">
        <ConciergeJourney />
      </div>
      
      <div id="featured-venues">
        <VenueSection />
      </div>
      
      <div id="featured-vendors">
        <VendorSection />
      </div>

      <DigitalSuiteSection />
      <CelebrateSection />
      
      <FloatingConciergeButton />
    </main>
  );
}
