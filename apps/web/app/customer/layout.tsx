import type { Metadata } from "next";
import CustomerDashboardClientLayout from "./CustomerDashboardClientLayout";

export const metadata: Metadata = {
  title: {
    template: "%s | YouMarriageWeArrange",
    default: "Customer Dashboard | YouMarriageWeArrange",
  },
  description: "Manage your wedding journey, curated shortlist, and verified recommendations in Hyderabad.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CustomerDashboardClientLayout>{children}</CustomerDashboardClientLayout>;
}
