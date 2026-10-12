import React from "react";
import { EINVITE_TEMPLATES } from "@/mock-data/e-invites";
import type { Metadata } from "next";
import TemplatePreviewClient from "./TemplatePreviewClient";

interface TemplatePageProps {
  params: Promise<{
    templateId: string;
  }>;
}

export async function generateMetadata({ params }: TemplatePageProps): Promise<Metadata> {
  const { templateId } = await params;
  const template = EINVITE_TEMPLATES.find(t => t.id === templateId);
  if (!template) return { title: "Template Not Found | YouMarriage" };
  
  return {
    title: `${template.name} - E-Invite Template | YouMarriage`,
    description: template.description,
  };
}

export default async function Page({ params }: TemplatePageProps) {
  const { templateId } = await params;
  return <TemplatePreviewClient templateId={templateId} />;
}
