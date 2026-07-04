import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import InspirationCard from "@/components/cards/InspirationCard";
import { typography, spacing, colors, layout, grid } from "@/styles";

export default function InspirationSection() {
  const categories = [
    {
      title: "Bridal Wear",
      slug: "bridal-wear",
      imageUrl: "/images/editorial/insp_bridal.png",
      aspectMobile: "aspect-[3/2]",
      aspectDesktop: "md:aspect-[3/4]"
    },
    {
      title: "Groom Wear",
      slug: "groom-wear",
      imageUrl: "/images/editorial/insp_groom.png",
      aspectMobile: "aspect-video",
      aspectDesktop: "md:aspect-[4/5]"
    },
    {
      title: "Jewellery",
      slug: "jewellery",
      imageUrl: "/images/editorial/insp_jewelry.png",
      aspectMobile: "aspect-video",
      aspectDesktop: "md:aspect-square"
    },
    {
      title: "Decor",
      slug: "decor",
      imageUrl: "/images/editorial/vendor_decoration.png",
      aspectMobile: "aspect-[3/2]",
      aspectDesktop: "md:aspect-[3/4]"
    },
    {
      title: "Photography",
      slug: "photography",
      imageUrl: "/images/editorial/insp_photography.png",
      aspectMobile: "aspect-[3/2]",
      aspectDesktop: "md:aspect-[4/5]"
    },
    {
      title: "Invitation Ideas",
      slug: "invitation-ideas",
      imageUrl: "/images/editorial/insp_invitation.png",
      aspectMobile: "aspect-video",
      aspectDesktop: "md:aspect-square"
    }
  ];

  return (
    <section className={`${spacing.section} ${colors.bgPrimary} relative`}>
      <div className={`${layout.maxWidth} ${spacing.container}`}>
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-12 pb-5 border-b border-neutral-border gap-4">
          <div className="text-center sm:text-left">
            <span className="font-sans text-[10px] font-black uppercase text-accent-gold tracking-[0.25em] block mb-2">
              CHOOSE • Get Wedding Inspiration
            </span>
            <h2 className={typography.sectionTitle}>
              Get Wedding Inspiration
            </h2>
          </div>
          <Link
            href="/inspiration"
            className={`hidden sm:flex items-center gap-1 ${typography.label} text-primary hover:text-primary-dark transition-colors group shrink-0`}
          >
            <span>Explore All Ideas</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Pinterest Staggered Grid (Mobile CSS Columns, Desktop Editorial Grid) */}
        <div className={`${grid.pinterest} space-y-2 md:space-y-0`}>
          {categories.map((category) => (
            <div key={category.slug} className="break-inside-avoid mb-2 md:mb-6">
              <InspirationCard category={category} />
            </div>
          ))}
        </div>

        {/* Mobile View More Button */}
        <div className="mt-8 sm:hidden flex justify-center">
          <Link
            href="/inspiration"
            className={`px-6 py-3 border ${colors.border} rounded-full ${typography.button} text-neutral-charcoal flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors w-full`}
          >
            <span>View More Inspiration</span>
            <ChevronRight className="w-4 h-4 text-primary" />
          </Link>
        </div>
      </div>
    </section>
  );
}
