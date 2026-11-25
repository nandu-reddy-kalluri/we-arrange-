import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ShieldCheck, HeartHandshake, Compass, Award, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | YouMarriageWeArrange — Hyderabad's Luxury Wedding Concierge",
  description: "Learn about YouMarriageWeArrange, Hyderabad's premier white-glove wedding concierge service dedicated to effortless celebration planning.",
};

const VALUES = [
  {
    icon: Sparkles,
    title: "White-Glove Hospitality",
    description: "Every couple is assigned a dedicated concierge specialist who personally handles vendor sourcing, dates, negotiations, and walkthroughs.",
  },
  {
    icon: ShieldCheck,
    title: "Strictly Vetted Partners",
    description: "We partner exclusively with verified luxury venues and certified vendors in Hyderabad. Zero spam listings, zero fake reviews.",
  },
  {
    icon: HeartHandshake,
    title: "Transparent Negotiation",
    description: "Our concierge team leverages direct relationships with top hospitality brands to secure the most favorable dates and transparent rates for you.",
  },
  {
    icon: Compass,
    title: "End-to-End Orchestration",
    description: "From palace ballrooms to destination lawns, bespoke caterers to celebrity photographers, we coordinate every detail seamlessly.",
  },
];

const STATS = [
  { value: "1,100+", label: "Vetted Hyderabad Venues" },
  { value: "2,900+", label: "Artisan Wedding Vendors" },
  { value: "100%", label: "Verified Reviews & Contracts" },
  { value: "24 hrs", label: "Average Concierge Response" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] pt-24 pb-20">
      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 py-16 md:py-24 max-w-6xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-xs font-semibold tracking-wider uppercase mb-6">
          <Award className="w-3.5 h-3.5" />
          The YMWA Standard
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1A0308] leading-tight mb-6">
          Bespoke Weddings, <br className="hidden sm:inline" />
          <span className="italic font-normal text-[#C8A165]">Flawlessly Arranged.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-neutral-600 leading-relaxed font-sans mb-10">
          YouMarriageWeArrange (YMWA) was born out of a singular mission: eliminating the chaos of wedding planning for modern couples by delivering Hyderabad’s finest venues, artisans, and white-glove concierge expertise under one unified roof.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-neutral-200">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-4">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[#8B263E] mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-neutral-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="bg-white py-16 md:py-24 border-y border-neutral-100">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0308] mb-6">
              Why Hyderabad Chooses YMWA
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Planning a wedding in Hyderabad should be a joyous milestone, not a storm of unreturned phone calls, opaque pricing sheets, and unsolicited marketing messages.
              </p>
              <p>
                At YMWA, we do not simply display directory listings. We act as your private wedding council. Our team works hand-in-hand with renowned properties like Taj Falaknuma, ITC Kohenur, Novotel, and Hyderabad’s top couturiers and cinematographers.
              </p>
              <p>
                Whether you envision a grand royal celebration in the Old City, a contemporary terrace reception in Financial District, or a serene outdoor affair in Shamshabad, our concierge orchestrates every step with precision.
              </p>
            </div>
          </div>

          {/* Pillars List */}
          <div className="grid grid-cols-1 gap-4">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8D8BC]/40 hover:border-[#8B263E]/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#8B263E]/10 flex items-center justify-center shrink-0 text-[#8B263E]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900 text-base mb-1">
                        {val.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                        {val.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Concierge CTA */}
      <section className="px-6 lg:px-12 py-16 md:py-20 max-w-4xl mx-auto text-center">
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1A0308] mb-4">
          Ready to Begin Your Wedding Journey?
        </h2>
        <p className="text-neutral-600 text-sm sm:text-base max-w-xl mx-auto mb-8">
          Speak with our concierge team today or explore Hyderabad’s top venues curated exclusively for you.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4">
          <Link
            href="/venues"
            className="px-6 py-3 rounded-full bg-[#8B263E] text-white text-sm font-semibold hover:bg-[#701E31] transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            Explore Venues
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-white border border-neutral-300 text-neutral-800 text-sm font-semibold hover:bg-neutral-50 transition-colors"
          >
            Contact Concierge
          </Link>
        </div>
      </section>
    </main>
  );
}
