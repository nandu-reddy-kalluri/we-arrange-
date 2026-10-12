import { mockVendors, vendorCategories } from "@we-arrange/database";
import type { Vendor, VendorCategory } from "@we-arrange/types";

export function getAllVendors(): Vendor[] {
  return mockVendors;
}

export function getVendorCategories(): VendorCategory[] {
  return vendorCategories;
}

export function getVendorBySlug(slug: string): Vendor | undefined {
  return mockVendors.find((v) => v.slug === slug);
}

export function getVendorsByCategory(categorySlug: string): Vendor[] {
  return mockVendors.filter((v) => v.category.toLowerCase() === categorySlug.toLowerCase());
}
