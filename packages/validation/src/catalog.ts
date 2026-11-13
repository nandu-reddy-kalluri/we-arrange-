import { z } from "zod";
import {
  catalogSortBySchema,
  isoDateSchema,
  paginationQuerySchema,
  positiveIntIdSchema,
  safeHttpUrlSchema,
  sortDirectionSchema,
} from "./common";

export const venueQuerySchema = paginationQuerySchema.extend({
  city: z.string().trim().max(80).optional(),
  locality: z.string().trim().max(120).optional(),
  areaId: positiveIntIdSchema.optional(),
  typeId: positiveIntIdSchema.optional(),
  type: z.string().trim().max(80).optional(),
  space: z.enum(["Indoor", "Outdoor", "Poolside", "Rooftop", "Garden"]).optional(),
  minCapacity: z.coerce.number().int().min(0).optional(),
  maxCapacity: z.coerce.number().int().min(1).optional(),
  q: z.string().trim().max(160).optional(),
  sortBy: catalogSortBySchema.optional(),
  sortOrder: sortDirectionSchema.optional(),
});

export const venueCreateSchema = z
  .object({
    typeId: positiveIntIdSchema,
    venueName: z.string().trim().min(2).max(200),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: z.string().trim().max(5000).optional(),
    shortSummary: z.string().trim().max(500).optional(),
    aboutVenue: z.string().trim().max(8000).optional(),
    areaId: positiveIntIdSchema.optional(),
    address: z.string().trim().max(500).optional(),
    baseCity: z.string().trim().max(80).optional(),
    localityName: z.string().trim().max(120).optional(),
    primaryLocality: z.string().trim().max(120).optional(),
    pincode: z.string().trim().max(16).optional(),
    capacity: z.coerce.number().int().min(1).max(50000).optional(),
    guestCountMin: z.coerce.number().int().min(1).optional(),
    guestCountMax: z.coerce.number().int().min(1).optional(),
    priceRange: z.string().trim().max(100).optional(),
    priceSubtext: z.string().trim().max(160).optional(),
    indoorOutdoorSpaces: z.string().trim().max(120).optional(),
    cateringPolicy: z.string().trim().max(300).optional(),
    decorPolicy: z.string().trim().max(300).optional(),
    website: safeHttpUrlSchema.optional(),
    googleMaps: safeHttpUrlSchema.optional(),
    features: z.record(z.string(), z.unknown()).optional(),
    rulesPolicies: z.record(z.string(), z.unknown()).optional(),
    status: z.enum(["Active", "Inactive", "Draft", "Pending"]).default("Active"),
    contactPhone: z.string().trim().max(30).optional(),
    whatsappAvailable: z.boolean().optional(),
  })
  .strict();

export const venueUpdateSchema = venueCreateSchema.partial().strict();

export const venuePricingUpsertSchema = z
  .object({
    startingPrice: z.coerce.number().min(0).optional(),
    vegPrice: z.coerce.number().min(0).optional(),
    nonVegPrice: z.coerce.number().min(0).optional(),
    rentalCost: z.coerce.number().min(0).optional(),
    priceTag: z.string().trim().max(80).optional(),
    priceSubtext: z.string().trim().max(160).optional(),
  })
  .strict();

export const venueAvailabilityCreateSchema = z
  .object({
    availableFrom: isoDateSchema,
    availableTo: isoDateSchema,
    isBooked: z.boolean().default(false),
  })
  .strict();

export const venueMediaUploadSignSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
    "video/mp4",
  ]),
  fileSizeBytes: z.coerce.number().int().positive().max(25 * 1024 * 1024),
});

export const venueMediaCreateSchema = z
  .object({
    mediaUrl: safeHttpUrlSchema,
    mediaType: z.enum(["image", "video"]).default("image"),
    isCover: z.boolean().default(false),
    sortOrder: z.coerce.number().int().min(0).default(0),
    title: z.string().trim().max(160).optional(),
  })
  .strict();

export const vendorQuerySchema = paginationQuerySchema.extend({
  category: z.string().trim().max(80).optional(),
  categoryId: positiveIntIdSchema.optional(),
  city: z.string().trim().max(80).optional(),
  verifiedOnly: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (v === true || v === "true" ? true : undefined))
    .optional(),
  q: z.string().trim().max(160).optional(),
  sortBy: z.enum(["relevance", "rating", "newest"]).default("relevance").optional(),
  sortOrder: sortDirectionSchema.optional(),
});

// Strict self-update schema: explicitly excludes is_verified, status, user_id, metadata
export const vendorSelfUpdateSchema = z
  .object({
    vendorName: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    logo: safeHttpUrlSchema.nullable().optional(),
    coverImage: safeHttpUrlSchema.nullable().optional(),
    categoryId: positiveIntIdSchema.optional(),
  })
  .strict();

export const vendorContactsUpsertSchema = z
  .object({
    contactPerson: z.string().trim().max(120).optional(),
    phone: z.string().trim().min(8).max(30).optional(),
    email: z.string().trim().email().optional(),
    address: z.string().trim().max(400).optional(),
  })
  .strict();

export const vendorServiceSchema = z
  .object({
    serviceName: z.string().trim().min(2).max(160),
    description: z.string().trim().max(2000).optional(),
  })
  .strict();

export const vendorPricingSchema = z
  .object({
    serviceName: z.string().trim().min(2).max(160),
    price: z.coerce.number().min(0),
    priceUnit: z.string().trim().max(60).optional(),
  })
  .strict();

export const vendorPackageSchema = z
  .object({
    packageName: z.string().trim().min(2).max(160),
    description: z.string().trim().max(2000).optional(),
    price: z.coerce.number().min(0),
  })
  .strict();

export const vendorFaqSchema = z
  .object({
    question: z.string().trim().min(3).max(400),
    answer: z.string().trim().min(3).max(4000),
    sortOrder: z.coerce.number().int().min(0).default(0),
  })
  .strict();

export const vendorSocialLinkSchema = z
  .object({
    platform: z.string().trim().min(2).max(60),
    url: safeHttpUrlSchema,
  })
  .strict();

export const vendorTeamMemberSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    role: z.string().trim().min(2).max(120),
    photo: safeHttpUrlSchema.optional(),
  })
  .strict();

export const adminVendorLinkSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();

export const adminVendorVerifySchema = z
  .object({
    isVerified: z.boolean(),
    status: z.enum(["Active", "Inactive", "Pending", "Rejected"]).optional(),
    remarks: z.string().trim().max(500).optional(),
  })
  .strict();

export const unifiedSearchQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().max(160).optional(),
  scope: z.enum(["all", "venues", "vendors"]).default("all"),
  city: z.string().trim().max(80).optional(),
  locality: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  type: z.string().trim().max(80).optional(),
  minCapacity: z.coerce.number().int().min(0).optional(),
  verifiedOnly: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => v === true || v === "true")
    .optional(),
  sortBy: catalogSortBySchema.optional(),
});

