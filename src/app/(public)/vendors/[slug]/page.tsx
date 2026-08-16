import React from "react";
import { mockVendors } from "@/mock-data/vendors";
import type { Metadata } from "next";
import VendorDetailsClient from "./VendorDetailsClient";

interface VendorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: VendorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vendor = mockVendors.find(v => v.slug === slug);
  if (!vendor) return { title: "Vendor Not Found | YouMarriage" };
  
  return {
    title: `${vendor.name} | YouMarriage Vendors`,
    description: vendor.description || `Book ${vendor.name} for your wedding on YouMarriage.`,
  };
}

export default async function Page({ params }: VendorPageProps) {
  const { slug } = await params;
  return <VendorDetailsClient slug={slug} />;
}
