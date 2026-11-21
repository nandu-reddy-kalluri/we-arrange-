import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { getPublicVenueBySlugOrId } from "@we-arrange/service-venue";
import VenueDetailsClient from "./VenueDetailsClient";

interface VenuePageProps {
  params: Promise<{
    slug: string;
  }>;
}

const VENUE_CATEGORY_ALIASES: Record<string, string> = {
  luxury: "/venues?venueType=Palace",
  destination: "/venues?venueType=Resort",
  hotels: "/venues?venueType=Hotel",
  hotel: "/venues?venueType=Hotel",
  resorts: "/venues?venueType=Resort",
  resort: "/venues?venueType=Resort",
  farmhouses: "/venues?venueType=Farmhouse",
  farmhouse: "/venues?venueType=Farmhouse",
  "banquet-halls": "/venues?venueType=Banquet+Hall",
  "banquet-hall": "/venues?venueType=Banquet+Hall",
  palace: "/venues?venueType=Palace",
  palaces: "/venues?venueType=Palace",
  royal: "/venues?search=Royal",
  garden: "/venues?space=Outdoor",
  beach: "/venues?venueType=Resort",
  modern: "/venues?venueType=Hotel",
  heritage: "/venues?venueType=Palace",
};

export async function generateMetadata({ params }: VenuePageProps): Promise<Metadata> {
  const { slug } = await params;
  const alias = VENUE_CATEGORY_ALIASES[slug.toLowerCase()];
  if (alias) {
    return {
      title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Wedding Venues | YouMarriage`,
      description: `Explore curated ${slug} wedding venues in Hyderabad on YouMarriage.`,
    };
  }

  try {
    const supabase = createPublicAnonClient();
    const detail = await getPublicVenueBySlugOrId(supabase, slug);
    const v = detail.venue as Record<string, unknown> | undefined;
    const name = typeof v?.venue_name === "string" ? v.venue_name.trim() : "";
    const city = typeof v?.base_city === "string" ? v.base_city.trim() : "";
    const summary =
      (typeof v?.short_summary === "string" && v.short_summary.trim()) ||
      (typeof v?.description === "string" && v.description.trim()) ||
      `Explore ${name || "this wedding venue"} on YouMarriage.`;

    if (name) {
      return {
        title: `${city ? `${name} - ${city}` : name} | YouMarriage Venues`,
        description: summary,
      };
    }
  } catch {
    // 404 or transient lookup failure
  }

  return { title: "Venue Not Found | YouMarriage" };
}

export default async function Page({ params }: VenuePageProps) {
  const { slug } = await params;
  const alias = VENUE_CATEGORY_ALIASES[slug.toLowerCase()];
  if (alias) {
    redirect(alias);
  }
  return <VenueDetailsClient slug={slug} />;
}
