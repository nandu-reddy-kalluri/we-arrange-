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
  subCategory: string; // Used for tab filtering within category (e.g. "Lehenga", "Saree")
  date?: string;
  budgetRange?: string;
  featured?: boolean;
  
  // Specific metadata fields
  colorPalette?: ColorSwatch[];
  designerOrVendor?: string;
  styleTip?: string;
  keyHighlights?: string[];
  attributes?: Record<string, string>; // Key-value pairs for sidebar summary
}

export interface InspirationSubsectionConfig {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  heroImage: string;
  categories: string[]; // List of filter tabs for this subsection (e.g., ["All", "Lehengas", "Sarees", "Anarkalis"])
  stats: { label: string; value: number }[];
}
