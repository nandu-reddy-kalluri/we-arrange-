import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouMarriageWeArrange - Wedding Planning made Simple",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
