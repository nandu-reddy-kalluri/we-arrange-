"use client";

import React from "react";
import { LazyMotion, domAnimation, AnimatePresence } from "framer-motion";
import { VenuePreview } from "./VenuePreview";
import { VendorPreview } from "./VendorPreview";
import { ServicesPreview } from "./ServicesPreview";
import { InspirationPreview } from "./InspirationPreview";

interface NavigationPreviewProps {
  activeTab: string | null;
}

export function NavigationPreview({ activeTab }: NavigationPreviewProps) {
  const renderPreview = () => {
    switch (activeTab) {
      case "venues": return <VenuePreview key="venues" />;
      case "vendors": return <VendorPreview key="vendors" />;
      case "services": return <ServicesPreview key="services" />;
      case "inspiration": return <InspirationPreview key="inspiration" />;
      default: return null;
    }
  };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        {activeTab && renderPreview()}
      </AnimatePresence>
    </LazyMotion>
  );
}
