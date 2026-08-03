import React, { Suspense } from "react";
import { VendorsDirectoryClient, PageLoader } from "@/features/vendors/components/VendorsDirectoryClient";

export const metadata = {
  title: "Discover Premium Wedding Vendors | YouMarriageWeArrange",
  description: "Explore our curated collection of Hyderabad's elite wedding decorators, photographers, makeup artists, and caterers.",
};

export default function VendorsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <VendorsDirectoryClient />
    </Suspense>
  );
}
