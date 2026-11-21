"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerBookingsWorkspace } from "@we-arrange/ui";
import { useSavedStore } from "../../store/useSavedStore";

export default function CustomerBookingsPage() {
  const { savedVenueIds, savedVendorIds } = useSavedStore();

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/overview"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-600 hover:text-[#8B263E] transition-colors py-1.5 px-3 -ml-3 rounded-lg hover:bg-[#F5EEE7] w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#2D2D2D] font-bold">
          My Bookings, Enquiries & Quotes
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Track concierge enquiries, site visits, quotations, comparison sheets, contracts, and payments.
        </p>
      </div>

      <CustomerBookingsWorkspace
        catalogHref="/saved"
        savedVenueIds={savedVenueIds}
        savedVendorIds={savedVendorIds}
      />
    </div>
  );
}
