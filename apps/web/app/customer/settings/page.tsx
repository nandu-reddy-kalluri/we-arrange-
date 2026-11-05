import type { Metadata } from "next";
import CustomerSettingsClient from "./CustomerSettingsClient";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your profile information and notification preferences on YouMarriageWeArrange.",
};

export default function CustomerSettingsPage() {
  return <CustomerSettingsClient />;
}
