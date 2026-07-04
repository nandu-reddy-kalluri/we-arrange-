import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { vendorCategories } from "@/mock-data/vendors";
import { VendorScroller } from "./VendorScroller";
import { typography, spacing, colors, layout } from "@/styles";

export default function VendorSection() {
  return (
    <section className={`hidden md:block ${spacing.sectionSmall} ${colors.bgSecondary} relative border-t border-b ${colors.border}`}>
      <div className={`${layout.maxWidth} ${spacing.container}`}>
        <div className={`flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 pb-5 border-b ${colors.borderLight} gap-4`}>
          <div className="text-center sm:text-left">
            <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-2">
              CHOOSE • Concierge Sourced Partners
            </span>
            <h2 className={typography.sectionTitle}>
              Premium Vendor Categories
            </h2>
          </div>
          <Link
            href="/vendors"
            className={`flex items-center gap-1 ${typography.label} text-primary hover:text-primary-dark transition-colors group shrink-0 min-h-[48px]`}
          >
            <span>Talk To Specialist</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <VendorScroller categories={vendorCategories} />
      </div>
    </section>
  );
}
