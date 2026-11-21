import type { Metadata } from "next";
import FAQClient from "./FAQClient";
import { FAQS } from "./faqData";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Hyderabad Wedding Concierge",
  description: "Learn how YouMarriageWeArrange curates luxury venues, negotiates rates with 5-star hotels, prevents vendor spam, and coordinates seamless weddings.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/faq",
  },
  openGraph: {
    title: "Frequently Asked Questions | YouMarriageWeArrange",
    description: "Clear answers on luxury wedding venue curation, verified vendor matchmaking, and booking guarantees.",
    url: "https://www.youmarriagewearrange.com/faq",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: f.answer,
    },
  })),
};

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <FAQClient />
    </>
  );
}
