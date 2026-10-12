import React from "react";
import { VenueDiscoveryClient } from "@/features/venues/components/VenueDiscoveryClient";

export const metadata = {
  title: "Discover Luxury Wedding Venues | YouMarriageWeArrange",
  description: "Explore our curated collection of premium wedding venues in Hyderabad. Build your dream celebration with our luxury concierge and AI matchmaker.",
};

export default function VenuesPage() {
  return (
    <main>
      <VenueDiscoveryClient />
    </main>
  );
}
