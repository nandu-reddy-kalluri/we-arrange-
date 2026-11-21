import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Concierge Desk — Private Client Relations",
  description: "Connect with our Hyderabad wedding concierge desk. Request custom venue curation, private property tours, or bespoke vendor quotes.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/contact",
  },
  openGraph: {
    title: "Contact Concierge Desk | YouMarriageWeArrange",
    description: "Request custom venue curation, private property tours, or bespoke vendor quotes in Hyderabad.",
    url: "https://www.youmarriagewearrange.com/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
