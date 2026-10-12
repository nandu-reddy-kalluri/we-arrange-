import { featuredVenues } from "@we-arrange/database";
import type { Venue } from "@we-arrange/types";

export interface VenueSearchParams {
  city?: string;
  type?: string;
  space?: string;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  query?: string;
}

export function getAllVenues(): Venue[] {
  return featuredVenues;
}

export function getVenueBySlug(slug: string): Venue | undefined {
  return featuredVenues.find((v) => v.slug === slug);
}

export function searchVenues(params: VenueSearchParams = {}): Venue[] {
  return featuredVenues.filter((venue) => {
    if (params.city && venue.city.toLowerCase() !== params.city.toLowerCase()) {
      return false;
    }
    if (params.type && venue.type.toLowerCase() !== params.type.toLowerCase()) {
      return false;
    }
    if (params.space && venue.space.toLowerCase() !== params.space.toLowerCase()) {
      return false;
    }
    if (params.minCapacity && venue.maxCapacity < params.minCapacity) {
      return false;
    }
    if (params.query) {
      const q = params.query.toLowerCase();
      const match =
        venue.name.toLowerCase().includes(q) ||
        venue.location.toLowerCase().includes(q) ||
        venue.city.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });
}
