import { featuredVenues, mockVendors } from "@we-arrange/database";
import type { Venue, Vendor } from "@we-arrange/types";

// Legacy synchronous helpers preserved until frontend cutover phase
export function resolveSavedVenues(ids: string[]): Venue[] {
  return featuredVenues.filter((v) => ids.includes(v.id));
}

export function resolveSavedVendors(ids: string[]): Vendor[] {
  return mockVendors.filter((v) => ids.includes(v.id));
}

export function calculateShortlistSummary(venueIds: string[], vendorIds: string[]) {
  const venues = resolveSavedVenues(venueIds);
  const vendors = resolveSavedVendors(vendorIds);
  return {
    venuesCount: venues.length,
    vendorsCount: vendors.length,
    totalCount: venues.length + vendors.length,
  };
}

export * from "./customerService";
