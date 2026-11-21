import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Complete Wedding Planning Checklist and Milestones",
  description: "Month-by-month and week-by-week wedding checklist to stay organized from engagement to your wedding reception.",
  alternates: {
    canonical: "https://www.youmarriagewearrange.com/planning/checklist",
  },
};

import { ComingSoon } from "@/components/layout/ComingSoon";

export default function ChecklistPage() {
  return (
    <ComingSoon
      title="Wedding Checklist"
      description="Our comprehensive digital checklist is being curated by our wedding experts. Soon, you will be able to track every detail of your luxury celebration seamlessly."
      returnTo="/planning"
      returnLabel="Back to Planning"
    />
  );
}
