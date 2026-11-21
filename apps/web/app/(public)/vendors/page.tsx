import React, { Suspense } from "react";
import { VendorsDirectoryClient, PageLoader } from "@/features/vendors/components/VendorsDirectoryClient";

export const metadata = {
  title: "Discover Premium Wedding Vendors | YouMarriageWeArrange",
  description: "Explore our curated collection of Hyderabad's elite wedding decorators, photographers, makeup artists, and caterers.",
};

const CATEGORY_ALIAS: Record<string, string> = {
  photographers: "photography",
  "bridal-makeup": "makeup",
  decorators: "decor",
  "decor-florists": "decor",
};

export default async function VendorsPage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const rawCategory = typeof sp.category === "string" ? sp.category.toLowerCase().trim() : "";
  const defaultCategory = CATEGORY_ALIAS[rawCategory] ?? rawCategory;

  return (
    <Suspense fallback={<PageLoader />}>
      <VendorsDirectoryClient defaultCategory={defaultCategory} />
    </Suspense>
  );
}
