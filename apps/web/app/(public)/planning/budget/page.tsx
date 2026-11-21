import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Budget Planner and Expense Calculator",
  description: "Plan, allocate, and track your wedding expenses across venues, decor, catering, photography, and attire.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/budget",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function BudgetPage() {
  return (
    <ComingSoon
      title="Budget Calculator"
      description="We're crafting an intelligent budget tool to help you manage your wedding finances with precision and ease. Available in our next update."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
