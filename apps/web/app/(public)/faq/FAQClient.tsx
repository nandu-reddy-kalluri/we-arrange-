"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { FAQS, type FAQItem } from "./faqData";

export { FAQS, type FAQItem };

export default function FAQClient() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const categories = ["All", "Couples", "Venues & Vendors", "Payments & Safety"];

  const filteredFaqs = activeCategory === "All"
    ? FAQS
    : FAQS.filter((f) => f.category === activeCategory);

  const toggleIndex = (idx: number) => {
    if (openIndexes.includes(idx)) {
      setOpenIndexes(openIndexes.filter((i) => i !== idx));
    } else {
      setOpenIndexes([...openIndexes, idx]);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2D2D] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8B263E]/10 text-[#8B263E] text-xs font-semibold tracking-wider uppercase mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1A0308] tracking-tight mb-4">
            Clear Answers for Your Big Day
          </h1>
          <p className="text-neutral-600 text-sm sm:text-base max-w-xl mx-auto">
            Everything you need to know about our luxury concierge, venue curation, vendor matchmaking, and booking guarantees.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-[#8B263E] text-white shadow-sm"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div
                key={faq.question}
                className="bg-white border border-neutral-200/80 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 font-semibold text-neutral-900 hover:text-[#8B263E] transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#8B263E]" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-neutral-600 leading-relaxed border-t border-neutral-100">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-[#FAF7F2] border border-[#E8D8BC]/60 text-center">
          <h2 className="font-serif text-2xl font-bold text-[#1A0308] mb-2">
            Still have questions?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mb-6 max-w-md mx-auto">
            Our Hyderabad concierge advisors are ready to assist you seven days a week.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#701E31] transition-colors"
          >
            Speak with Concierge
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
