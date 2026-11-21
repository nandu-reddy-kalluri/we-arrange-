import React from "react";
import type { Metadata } from "next";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import {
  getPublicVendorBySlugOrId,
  listVendorCategories,
} from "@we-arrange/service-vendor";
import VendorDetailsClient from "./VendorDetailsClient";
import { VendorsDirectoryClient } from "@/features/vendors/components/VendorsDirectoryClient";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_ALIAS_TO_UI: Record<string, string> = {
  photography: "photography",
  photographers: "photography",
  makeup: "makeup",
  "bridal-makeup": "makeup",
  decor: "decor",
  decorators: "decor",
  "decor-florists": "decor",
  mehendi: "mehendi",
  catering: "catering",
};

async function resolveCategorySlug(slug: string): Promise<string | null> {
  const lower = slug.toLowerCase();
  if (lower in CATEGORY_ALIAS_TO_UI) {
    return CATEGORY_ALIAS_TO_UI[lower];
  }
  try {
    const supabase = createPublicAnonClient();
    const categories = await listVendorCategories(supabase);
    const matched = categories.find((c) => c.slug?.toLowerCase() === lower);
    if (matched) {
      return CATEGORY_ALIAS_TO_UI[lower] ?? matched.slug;
    }
  } catch {
    // Fall back to vendor detail lookup when categories cannot be queried
  }
  return null;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;

  const matchedCategory = await resolveCategorySlug(slug);
  if (matchedCategory) {
    const formattedCategory =
      matchedCategory.charAt(0).toUpperCase() + matchedCategory.slice(1);
    return {
      title: `${formattedCategory} Artists & Services | YouMarriage Vendors`,
      description: `Find the best ${formattedCategory} vendors in Hyderabad on YouMarriage.`,
    };
  }

  try {
    const supabase = createPublicAnonClient();
    const detail = await getPublicVendorBySlugOrId(supabase, slug);
    const vendorName = detail.vendor?.vendor_name;
    if (typeof vendorName === "string" && vendorName.trim()) {
      const desc =
        typeof detail.vendor.description === "string" &&
        detail.vendor.description.trim()
          ? detail.vendor.description
          : `Book ${vendorName} for your wedding on YouMarriage.`;
      return {
        title: `${vendorName} | YouMarriage Vendors`,
        description: desc,
      };
    }
  } catch {
    // 404 or transient lookup failure
  }

  return { title: "Vendor Not Found | YouMarriage" };
}

export default async function Page({ params }: VendorPageProps) {
  const { slug } = await params;

  const matchedCategory = await resolveCategorySlug(slug);
  if (matchedCategory) {
    return <VendorsDirectoryClient defaultCategory={matchedCategory} />;
  }

  return <VendorDetailsClient slug={slug} />;
}
