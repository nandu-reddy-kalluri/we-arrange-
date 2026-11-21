import type { Metadata } from "next";
import PlanningClient from "./PlanningClient";

export const metadata: Metadata = {
  title: "Wedding Planning Tools and Checklist — Complete Suite",
  description: "Explore our free wedding planning tools: budget calculator, guest list manager, day-of timeline creator, and wedding checklist for Hyderabad couples.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning",
  },
  openGraph: {
    title: "Wedding Planning Tools | YouMarriageWeArrange",
    description: "Budget calculator, guest list manager, day-of timeline creator, and wedding checklist.",
    url: "https://www.youmarriagewearrange.com/planning",
  },
};

export default function PlanningPage() {
  return <PlanningClient />;
}
