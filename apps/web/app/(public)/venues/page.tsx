import React from "react";
import { VenueDiscoveryClient } from "@/features/venues/components/VenueDiscoveryClient";
import { getCachedServerVenuesDirectory } from "@/services/catalog/catalogServer";

export const metadata = {
  title: "Discover Luxury Wedding Venues | YouMarriageWeArrange",
  description:
    "Explore our curated collection of premium wedding venues in Hyderabad. Build your dream celebration with our luxury concierge and AI matchmaker.",
};

export default async function VenuesPage() {
  const initialData = await getCachedServerVenuesDirectory(1, 20);

  return (
    <main>
      <VenueDiscoveryClient
        initialVenues={initialData.items}
        initialTotal={initialData.total}
        initialTotalPages={initialData.totalPages}
      />
    </main>
  );
}
