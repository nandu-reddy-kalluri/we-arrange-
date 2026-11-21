"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CustomerSettingsWorkspace } from "@we-arrange/ui";

export default function CustomerSettingsClient() {
  return (
    <div>
      <div className="mb-6">
        <Link
          href="/customer/overview"
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-neutral-600 hover:text-[#8B263E] transition-colors py-1.5 px-3 -ml-3 rounded-lg hover:bg-[#F5EEE7] w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-serif text-[#2D2D2D] font-bold">
          Account Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage your profile, avatar, wedding planning preferences, notifications, and security settings.
        </p>
      </div>

      <CustomerSettingsWorkspace />
    </div>
  );
}
