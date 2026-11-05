import type { Metadata } from "next";
import CustomerOverviewClient from "./CustomerOverviewClient";

export const metadata: Metadata = {
  title: "Customer Overview",
  description: "Personal wedding concierge overview, saved venues, and verified recommendations in Hyderabad.",
};

export default function CustomerOverviewPage() {
  return <CustomerOverviewClient />;
}
