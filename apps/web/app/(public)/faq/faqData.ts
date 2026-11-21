export interface FAQItem {
  question: string;
  answer: string;
  category: "Couples" | "Venues & Vendors" | "Payments & Safety";
}

export const FAQS: FAQItem[] = [
  {
    category: "Couples",
    question: "What is YouMarriageWeArrange (YMWA)?",
    answer: "YMWA is Hyderabad's dedicated luxury wedding concierge platform. Rather than overwhelming you with endless unverified directory entries and spam calls, our concierge team learns your vision, curates verified venues and vendors, negotiates official pricing, and coordinates visits and bookings seamlessly.",
  },
  {
    category: "Couples",
    question: "Is using the YMWA concierge service free for couples?",
    answer: "Yes, browsing Hyderabad venues, discovering luxury vendors, and receiving curated recommendations from our concierge is complimentary for registered couples. We earn a standardized coordination fee directly from participating hospitality partners upon confirmed bookings.",
  },
  {
    category: "Couples",
    question: "How do you protect couples from unsolicited vendor sales calls?",
    answer: "We strictly uphold a Zero-Spam pledge. Your contact number and personal email are never shared publicly or sold to third-party marketing lists. Only venues and vendors you explicitly approve to proceed receive your coordination brief through our concierge desk.",
  },
  {
    category: "Couples",
    question: "Can YMWA help negotiate pricing with 5-star hotel ballrooms?",
    answer: "Yes. Our concierge team maintains institutional partnerships and volume relationships with premier hotel groups across Hyderabad (including Taj, ITC, Marriott, Novotel, and Park Hyatt), allowing us to secure optimal package inclusions, complimentary bridal suites, and tailored catering rates.",
  },
  {
    category: "Venues & Vendors",
    question: "How can a venue or vendor list on YMWA?",
    answer: "We welcome applications from high-standard venues and vendors in and around Hyderabad. Every partner must pass our 5-point quality audit, verify business registration, and maintain high customer satisfaction standards. You can apply via our Vendor Portal.",
  },
  {
    category: "Venues & Vendors",
    question: "What are the requirements for concierge vetting?",
    answer: "We evaluate real portfolio quality, client reviews from the past 24 months, punctuality track records, transparent pricing compliance, and verified GST/business credentials.",
  },
  {
    category: "Payments & Safety",
    question: "How are payments handled on YMWA?",
    answer: "All transaction milestones, booking tokens, and contract payments are processed through secure, bank-grade payment channels (RBI-authorized gateways) with instant digital receipts and signed milestone confirmations.",
  },
  {
    category: "Payments & Safety",
    question: "What happens if a wedding date needs to be rescheduled?",
    answer: "Each venue and vendor contract adheres to clearly specified rescheduling and cancellation terms presented prior to payment. In unforeseen circumstances, our concierge intervenes directly to arrange date transfers with minimal disruption or penalty.",
  },
];
