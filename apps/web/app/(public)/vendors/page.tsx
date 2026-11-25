import React, { Suspense } from "react";
import { VendorsDirectoryClient, PageLoader } from "@/features/vendors/components/VendorsDirectoryClient";
import { getCachedServerVendorsDirectory } from "@/services/catalog/catalogServer";

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

  const initialData = await getCachedServerVendorsDirectory(defaultCategory, 1, 20);

  return (
    <Suspense fallback={<PageLoader />}>
      <VendorsDirectoryClient
        defaultCategory={defaultCategory}
        initialVendors={initialData.items}
        initialTotal={initialData.total}
        initialTotalPages={initialData.totalPages}
      />
    </Suspense>
  );
}
