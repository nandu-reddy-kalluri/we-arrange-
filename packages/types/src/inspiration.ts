export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface InspirationDetailItem {
  id: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  title: string;
  subtitle?: string;
  shortDescription: string;
  description: string;
  heroImage: string;
  gallery: string[];
  tags: string[];
  subCategory: string;
  date?: string;
  budgetRange?: string;
  featured?: boolean;
  colorPalette?: ColorSwatch[];
  designerOrVendor?: string;
  styleTip?: string;
  keyHighlights?: string[];
  attributes?: Record<string, string>;
}

export interface InspirationSubsectionConfig {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  heroImage: string;
  categories: string[];
  stats: { label: string; value: number }[];
}
