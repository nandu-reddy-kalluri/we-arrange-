import React from "react";
import { Metadata } from "next";
import { WeddingStudioHero } from "@/features/wedding-studio/components/WeddingStudioHero";
import { StudioProducts } from "@/features/wedding-studio/components/StudioProducts";
import { PopularTemplates } from "@/features/wedding-studio/components/PopularTemplates";
import { HowItWorks } from "@/features/wedding-studio/components/HowItWorks";
import { WhyWeddingStudio } from "@/features/wedding-studio/components/WhyWeddingStudio";
import { StudioCTA } from "@/features/wedding-studio/components/StudioCTA";

export const metadata: Metadata = {
  title: "Wedding Studio | YouMarriage WEARRANGE",
  description: "Create your perfect wedding digital experience. Design stunning eInvites and beautiful wedding websites that tell your unique love story.",
};

export default function WeddingStudioPage() {
  return (
    <main className="min-h-screen bg-[#FBF8F4]">
      <WeddingStudioHero />
      <StudioProducts />
      <PopularTemplates />
      <HowItWorks />
      <WhyWeddingStudio />
      <StudioCTA />
    </main>
  );
}
