import React from "react";
import { featuredVenues } from "@/mock-data/venues";
import type { Metadata } from "next";
import VenueDetailsClient from "./VenueDetailsClient";

interface VenuePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const venue = featuredVenues.find(v => v.slug === slug);
  if (!venue) return { title: "Venue Not Found | YouMarriage" };
  
  return {
    title: `${venue.name} - ${venue.city} | YouMarriage Venues`,
    description: `Book ${venue.name} for your wedding. Features: ${venue.space}, ${venue.maxCapacity} pax capacity.`,
  };
}

export default async function Page({ params }: VenuePageProps) {
  const { slug } = await params;
  return <VenueDetailsClient slug={slug} />;
}
