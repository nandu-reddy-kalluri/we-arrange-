import type { Metadata } from "next";
import CustomerBookingsClient from "./CustomerBookingsClient";

export const metadata: Metadata = {
  title: "My Bookings & Quotes",
  description: "Track verified venue site visits, vendor bookings, and concierge quotations in Hyderabad.",
};

export default function CustomerBookingsPage() {
  return <CustomerBookingsClient />;
}
