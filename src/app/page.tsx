import React from "react";
import HeroSection from "@/features/home/components/HeroSection";
import RequirementsPreview from "@/features/home/components/RequirementsPreview";
import WhyChooseUs from "@/features/home/components/WhyChooseUs";
import HowItWorks from "@/features/home/components/HowItWorks";
import VenueSection from "@/features/home/components/VenueSection";
import VendorSection from "@/features/home/components/VendorSection";
import InspirationSection from "@/features/home/components/InspirationSection";
import { MobileQuickSearchChips } from "@/features/home/components/MobileQuickSearchChips";
import { TrustStrip } from "@/features/home/components/TrustStrip";
import { ClientScrollRail } from "@/components/layout/ClientScrollRail";
import { FloatingConciergeButton } from "@/components/layout/FloatingConciergeButton";
import DigitalSuiteSection from "@/features/home/components/DigitalSuiteSection";
import CelebrateSection from "@/features/home/components/CelebrateSection";

export const metadata = {
  title: "YouMarriageWeArrange | Hyderabad's Premium Wedding Concierge",
  description: "Submit your wedding requirements and let our experts curate and negotiate the perfect venue and vendors. A white-glove concierge service.",
  openGraph: {
    title: "YouMarriageWeArrange",
    description: "Hyderabad's Premium Wedding Concierge",
  }
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  const location = (params.location as string) || "";
  const guests = (params.guests as string) || "";
  const budget = (params.budget as string) || "";

  let baseVenues = 18;
  let baseVendors = 42;
  if (guests === "Under 200") { baseVenues = 8; baseVendors = 16; }
  else if (guests === "200-500") { baseVenues = 12; baseVendors = 28; }
  
  if (location) { baseVenues = Math.max(2, Math.floor(baseVenues * 0.4)); }
  if (budget) { baseVenues = Math.max(1, Math.floor(baseVenues * 0.6)); }

  return (
    <main className="overflow-hidden relative bg-neutral-cream">
      <ClientScrollRail />
      
      <div id="hero">
        <HeroSection />
      </div>

      <TrustStrip />
      <MobileQuickSearchChips />
      
      <RequirementsPreview 
        location={location}
        guests={guests}
        budget={budget}
        venuesCount={baseVenues}
        vendorsCount={baseVendors}
      />
      
      <div id="meet-concierge">
        <WhyChooseUs />
      </div>
      
      <div id="how-it-works">
        <HowItWorks />
      </div>
      
      <div id="featured-venues">
        <VenueSection />
      </div>
      
      <VendorSection />
      <InspirationSection />
      <DigitalSuiteSection />
      <CelebrateSection />
      
      <FloatingConciergeButton />
    </main>
  );
}
