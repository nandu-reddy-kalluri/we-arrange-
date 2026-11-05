import type { Metadata } from "next";
import CustomerSavedClient from "./CustomerSavedClient";

export const metadata: Metadata = {
  title: "Saved Shortlist",
  description: "Your saved wedding venues and vendors in Hyderabad. Compare, plan, and connect seamlessly.",
};

export default function CustomerSavedPage() {
  return <CustomerSavedClient />;
}
