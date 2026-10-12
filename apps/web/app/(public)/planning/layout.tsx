import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Planning Tools — YouMarriageWeArrange",
  description:
    "Access premium wedding planning tools including checklist, budget planner, guest list management, and timeline planning.",
};

export default function PlanningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
