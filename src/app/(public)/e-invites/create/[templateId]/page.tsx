import React from "react";
import { EINVITE_TEMPLATES } from "@/mock-data/e-invites";
import type { Metadata } from "next";
import CreateInviteClient from "./CreateInviteClient";

interface CreatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export async function generateMetadata({ params }: CreatePageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = EINVITE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return { title: "Create Invitation | YouMarriage" };
  
  return {
    title: `Create ${template.name} - Invitation Builder | YouMarriage`,
    description: "Design your custom wedding digital invitation card and RSVP dashboard.",
  };
}

export default async function Page({ params }: CreatePageProps) {
  const { templateId } = await params;
  return <CreateInviteClient templateId={templateId} />;
}
