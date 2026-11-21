import type { Metadata } from "next";
import EInvitesClient from "./EInvitesClient";

export const metadata: Metadata = {
  title: "Luxury E-Invites, Video Cards and Save-the-Dates",
  description: "Craft bespoke digital wedding invitations, animated video cards, and elegant Save-the-Date announcements for your guests.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/e-invites",
  },
  openGraph: {
    title: "Luxury Wedding E-Invites | YouMarriageWeArrange",
    description: "Customizable digital cards, video invitations, and Save-the-Date announcements.",
    url: "https://www.youmarriagewearrange.com/e-invites",
  },
};

export default function EInvitesPage() {
  return <EInvitesClient />;
}
