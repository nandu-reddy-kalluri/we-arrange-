import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — YouMarriageWeArrange Premium Concierge",
  description:
    "Log in to your private YouMarriageWeArrange portal to review negotiated venue quotes, custom planning timelines, and elite vendor packages in Hyderabad.",
  openGraph: {
    title: "Sign In — YouMarriageWeArrange Premium Concierge",
    description:
      "Access your bespoke wedding concierge dashboard with YouMarriageWeArrange.",
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
