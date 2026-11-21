import { z } from "zod";
import {
  inrAmountSchema,
  isoDateSchema,
  isoDateTimeSchema,
  paginationQuerySchema,
  positiveIntIdSchema,
  safeHttpUrlSchema,
  uuidSchema,
} from "./common";

export const leadInquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid 10-digit phone number is required"),
  weddingDate: z.string().min(1, "Wedding date is required"),
  guestCount: z.number().min(10, "Guest count must be at least 10"),
  budgetRange: z.string().min(1, "Budget range is required"),
  notes: z.string().optional(),
});

export type LeadInquiryFormData = z.infer<typeof leadInquirySchema>;

export const enquiryCreateSchema = z
  .object({
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    subject: z.string().trim().min(3).max(200),
    message: z.string().trim().min(5).max(4000),
    eventDate: isoDateSchema.optional(),
    guestCount: z.coerce.number().int().min(10).max(20000).optional(),
    budgetRange: z.string().trim().max(100).optional(),
    preferredCity: z.string().trim().max(80).optional(),
  })
  .strict();

export const enquiryMessageCreateSchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
  })
  .strict();

export const conciergeEnquiryStatusSchema = z
  .object({
    status: z.enum(["Pending", "Active", "Approved", "Rejected"]),
    remarks: z.string().trim().max(1000).optional(),
  })
  .strict();

export const adminEnquiryAssignSchema = z
  .object({
    specialistId: uuidSchema,
    remarks: z.string().trim().max(500).optional(),
  })
  .strict();

export const siteVisitUpdateSchema = z
  .object({
    siteVisitAt: isoDateTimeSchema.optional(),
    siteVisitStatus: z.enum(["Requested", "Scheduled", "Completed", "Cancelled"]),
    siteVisitNotes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const quoteCreateSchema = z
  .object({
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    packageName: z.string().trim().min(2).max(160),
    baseCostInr: inrAmountSchema,
    cateringIncluded: z.boolean().default(false),
    inclusions: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
    exclusions: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
    notes: z.string().trim().max(2000).optional(),
    validUntil: isoDateSchema.optional(),
    status: z.enum(["Draft", "Published"]).default("Draft"),
  })
  .strict()
  .refine((d) => Boolean(d.venueId) !== Boolean(d.vendorId), {
    message: "Quote must target either venueId OR vendorId (mutually exclusive)",
  });

export const quoteUpdateSchema = z
  .object({
    packageName: z.string().trim().min(2).max(160).optional(),
    baseCostInr: inrAmountSchema.optional(),
    cateringIncluded: z.boolean().optional(),
    inclusions: z.array(z.string().trim().min(1).max(240)).max(50).optional(),
    exclusions: z.array(z.string().trim().min(1).max(240)).max(50).optional(),
    notes: z.string().trim().max(2000).nullable().optional(),
    validUntil: isoDateSchema.nullable().optional(),
    status: z.enum(["Draft", "Published", "Approved", "Rejected"]).optional(),
  })
  .strict();

export const quoteRespondSchema = z
  .object({
    decision: z.enum(["Approved", "Rejected"]),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const comparisonSheetCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(160),
    quoteIds: z.array(positiveIntIdSchema).min(2, "At least 2 quotes are required to compare").max(8),
    summaryNotes: z.string().trim().max(2000).optional(),
    status: z.enum(["Draft", "Published"]).default("Published"),
  })
  .strict();

export const comparisonPreviewSchema = z
  .object({
    venueIds: z.array(positiveIntIdSchema).max(6).default([]),
    vendorIds: z.array(positiveIntIdSchema).max(6).default([]),
  })
  .strict()
  .refine((d) => d.venueIds.length + d.vendorIds.length >= 2, {
    message: "Provide at least 2 shortlisted venueIds/vendorIds to compare",
  });

export const bookingCreateFromQuoteSchema = z
  .object({
    quoteId: positiveIntIdSchema,
    eventDate: isoDateSchema,
    guestCount: z.coerce.number().int().min(10).max(20000).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .strict();

export const bookingStatusUpdateSchema = z
  .object({
    statusName: z.enum([
      "Pending",
      "Confirmed",
      "In Progress",
      "Completed",
      "Cancelled",
      "Refunded",
    ]),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const bookingDocumentCreateSchema = z
  .object({
    documentName: z.string().trim().min(2).max(160),
    documentUrl: safeHttpUrlSchema,
    documentType: z.enum(["contract", "invoice", "receipt", "floorplan", "other"]).default("contract"),
  })
  .strict();

export const enquiryListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["Pending", "Active", "Approved", "Rejected"]).optional(),
  assignedToMe: z.enum(["true", "false"]).optional(),
});

export const vendorQuoteCreateSchema = z
  .object({
    enquiryId: positiveIntIdSchema,
    packageName: z.string().trim().min(2).max(160),
    baseCostInr: inrAmountSchema,
    cateringIncluded: z.boolean().default(false),
    inclusions: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
    exclusions: z.array(z.string().trim().min(1).max(240)).max(50).default([]),
    notes: z.string().trim().max(2000).optional(),
    validUntil: isoDateSchema.optional(),
    status: z.enum(["Draft", "Published"]).default("Published"),
  })
  .strict();

export type VendorQuoteCreateInput = z.infer<typeof vendorQuoteCreateSchema>;

