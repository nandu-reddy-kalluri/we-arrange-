import React from "react";
import { mockVendors } from "@/mock-data/vendors";
import type { Metadata } from "next";
import VendorDetailsClient from "./VendorDetailsClient";
import { VendorsDirectoryClient } from "@/features/vendors/components/VendorsDirectoryClient";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const CATEGORY_SLUGS = [
  "photography",
  "makeup",
  "decor",
  "mehendi",
  "catering"
];

// Helper to determine if slug is a category or detail page
const isCategorySlug = (slug: string) => CATEGORY_SLUGS.includes(slug.toLowerCase());

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  if (isCategorySlug(slug)) {
    const formattedCategory = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
      title: `${formattedCategory} Artists & Services | YouMarriage Vendors`,
      description: `Find the best ${formattedCategory} vendors in Hyderabad on YouMarriage.`,
    };
  }

  const vendor = mockVendors.find(v => v.slug === slug);
  if (!vendor) return { title: "Vendor Not Found | YouMarriage" };
  
  return {
    title: `${vendor.name} | YouMarriage Vendors`,
    description: vendor.description || `Book ${vendor.name} for your wedding on YouMarriage.`,
  };
}

export default async function Page({ params }: VendorPageProps) {
  const { slug } = await params;
  
  if (isCategorySlug(slug)) {
    return <VendorsDirectoryClient defaultCategory={slug.toLowerCase()} />;
  }

  return <VendorDetailsClient slug={slug} />;
}
