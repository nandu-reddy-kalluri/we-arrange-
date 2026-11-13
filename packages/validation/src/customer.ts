import { z } from "zod";
import { isoDateSchema, positiveIntIdSchema, safeHttpUrlSchema } from "./common";

export const customerPreferencesSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    smsNotifications: z.boolean().optional(),
    whatsappNotifications: z.boolean().optional(),
    preferredCity: z.string().trim().max(80).optional(),
    preferredBudgetRange: z.string().trim().max(80).optional(),
    weddingDate: isoDateSchema.optional(),
    estimatedGuests: z.coerce.number().int().min(10).max(20000).optional(),
  })
  .strict();

export const updateCustomerProfileSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120).optional(),
    phone: z.string().trim().min(8).max(20).nullable().optional(),
    address: z.string().trim().max(300).nullable().optional(),
    cityId: positiveIntIdSchema.nullable().optional(),
    areaId: positiveIntIdSchema.nullable().optional(),
    pincode: z.string().trim().min(4).max(12).nullable().optional(),
    about: z.string().trim().max(1500).nullable().optional(),
    gender: z.string().trim().max(40).nullable().optional(),
    dob: isoDateSchema.nullable().optional(),
    profileImage: safeHttpUrlSchema.nullable().optional(),
    preferences: customerPreferencesSchema.optional(),
  })
  .strict();

export const avatarUploadUrlSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  fileSizeBytes: z.coerce.number().int().positive().max(5 * 1024 * 1024, "Avatar max size is 5MB"),
});

export const favoriteCreateSchema = z
  .object({
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    inspirationId: positiveIntIdSchema.optional(),
    blogId: positiveIntIdSchema.optional(),
    collectionId: positiveIntIdSchema.optional(),
  })
  .strict()
  .refine(
    (d) => {
      const count =
        (d.venueId ? 1 : 0) +
        (d.vendorId ? 1 : 0) +
        (d.inspirationId ? 1 : 0) +
        (d.blogId ? 1 : 0);
      return count === 1;
    },
    { message: "Exactly one target (venueId, vendorId, inspirationId, or blogId) must be supplied" }
  );

export const collectionCreateSchema = z
  .object({
    collectionName: z.string().trim().min(1).max(120),
    description: z.string().trim().max(500).optional(),
  })
  .strict();

export const collectionUpdateSchema = collectionCreateSchema.partial().strict();

export const recentSearchCreateSchema = z
  .object({
    searchQuery: z.string().trim().min(1).max(200),
    searchType: z.enum(["venue", "vendor", "all", "inspiration", "blog"]).default("all"),
  })
  .strict();

export const savedFilterCreateSchema = z
  .object({
    filterName: z.string().trim().min(1).max(120),
    filterData: z.record(z.string(), z.unknown()),
  })
  .strict();

