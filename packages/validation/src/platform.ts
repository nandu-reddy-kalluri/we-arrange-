import { z } from "zod";
import {
  inrAmountSchema,
  isoDateSchema,
  paginationQuerySchema,
  positiveIntIdSchema,
  safeHttpUrlSchema,
  slugSchema,
  uuidSchema,
} from "./common";

// ── Reviews & Moderation ─────────────────────────────────────────────────────
export const reviewCreateSchema = z
  .object({
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    rating: z.coerce.number().min(1).max(5),
    reviewText: z.string().trim().min(10).max(4000),
    imageUrls: z.array(safeHttpUrlSchema).max(6).default([]),
  })
  .strict()
  .refine((d) => Boolean(d.venueId) !== Boolean(d.vendorId), {
    message: "Review must target either venueId OR vendorId (mutually exclusive)",
  });

export const reviewUpdateSchema = z
  .object({
    rating: z.coerce.number().min(1).max(5).optional(),
    reviewText: z.string().trim().min(10).max(4000).optional(),
  })
  .strict();

export const reviewVoteSchema = z
  .object({
    voteType: z.enum(["helpful", "unhelpful"]),
  })
  .strict();

export const reportCreateSchema = z
  .object({
    reasonId: positiveIntIdSchema.optional(),
    reportedUserId: uuidSchema.optional(),
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    reviewId: positiveIntIdSchema.optional(),
    blogId: positiveIntIdSchema.optional(),
    description: z.string().trim().min(5).max(2000),
  })
  .strict()
  .refine(
    (d) => Boolean(d.reportedUserId || d.venueId || d.vendorId || d.reviewId || d.blogId),
    { message: "Report must specify a target entity" }
  );

export const moderationDecisionSchema = z
  .object({
    status: z.enum(["Approved", "Rejected", "Published", "Inactive"]),
    remarks: z.string().trim().max(1000).optional(),
  })
  .strict();

export const reportResolveSchema = z
  .object({
    status: z.enum(["active", "inactive", "pending"]),
    action: z.string().trim().min(2).max(120),
    remarks: z.string().trim().max(1000).optional(),
  })
  .strict();

// ── Admin RBAC & Settings ────────────────────────────────────────────────────
export const adminUserUpdateSchema = z
  .object({
    roleName: z.enum(["customer", "vendor", "concierge", "admin"]).optional(),
    status: z.enum(["Active", "Inactive", "Pending"]).optional(),
  })
  .strict();

export const adminRoleCreateSchema = z
  .object({
    roleName: z.string().trim().min(2).max(60),
    permissionNames: z.array(z.string().trim().min(2).max(100)).optional(),
  })
  .strict();

export const adminAssignSchema = z
  .object({
    userId: uuidSchema,
    adminName: z.string().trim().min(2).max(120),
    status: z.enum(["active", "inactive", "pending"]).default("active"),
  })
  .strict();

export const appSettingUpdateSchema = z
  .object({
    settingKey: z.string().trim().min(2).max(120),
    settingValue: z.string().max(4000),
    description: z.string().trim().max(500).optional(),
    dataType: z.enum(["text", "number", "boolean", "json"]).default("text"),
  })
  .strict();

// ── CMS, Blogs & E-Invites ───────────────────────────────────────────────────
export const cmsPageUpsertSchema = z
  .object({
    pageName: z.string().trim().min(2).max(120),
    slug: slugSchema,
    title: z.string().trim().max(200).optional(),
    content: z.string().max(50000).optional(),
    featuredImage: safeHttpUrlSchema.nullable().optional(),
    status: z.enum(["Draft", "Published", "Inactive"]).default("Published"),
    seo: z
      .object({
        metaTitle: z.string().trim().max(200).optional(),
        metaDescription: z.string().trim().max(500).optional(),
        metaKeywords: z.string().trim().max(400).optional(),
        canonicalUrl: safeHttpUrlSchema.optional(),
        ogTitle: z.string().trim().max(200).optional(),
        ogDescription: z.string().trim().max(500).optional(),
        ogImage: safeHttpUrlSchema.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();

export const cmsBlogUpsertSchema = z
  .object({
    categoryId: positiveIntIdSchema.optional(),
    title: z.string().trim().min(3).max(220),
    slug: slugSchema.optional(),
    shortDescription: z.string().trim().max(600).optional(),
    content: z.string().max(80000).optional(),
    featuredImage: safeHttpUrlSchema.nullable().optional(),
    tags: z.array(z.string().trim().min(1).max(60)).max(20).optional(),
    status: z.enum(["Draft", "Published", "Inactive"]).default("Draft"),
  })
  .strict();

export const blogCommentCreateSchema = z
  .object({
    comment: z.string().trim().min(2).max(2000),
  })
  .strict();

export const cmsBannerUpsertSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    subtitle: z.string().trim().max(500).optional(),
    imageUrl: safeHttpUrlSchema.optional(),
    mobileImageUrl: safeHttpUrlSchema.optional(),
    buttonText: z.string().trim().max(80).optional(),
    buttonUrl: z.string().trim().max(400).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    status: z.enum(["active", "inactive", "pending"]).default("active"),
  })
  .strict();

export const cmsHomeSectionUpsertSchema = z
  .object({
    sectionName: z.string().trim().min(2).max(120),
    sectionType: z.string().trim().max(80).optional(),
    title: z.string().trim().max(220).optional(),
    description: z.string().trim().max(1000).optional(),
    content: z.record(z.string(), z.unknown()).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    status: z.enum(["Active", "Inactive", "Draft"]).default("Active"),
  })
  .strict();

export const cmsFaqUpsertSchema = z
  .object({
    question: z.string().trim().min(3).max(400),
    answer: z.string().trim().min(3).max(4000),
    category: z.string().trim().max(100).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .strict();

export const cmsTestimonialUpsertSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    designation: z.string().trim().max(120).optional(),
    message: z.string().trim().min(5).max(2000),
    imageUrl: safeHttpUrlSchema.optional(),
    rating: z.coerce.number().min(1).max(5).optional(),
    sortOrder: z.coerce.number().int().min(0).default(0),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .strict();

export const inviteCreateSchema = z
  .object({
    templateId: positiveIntIdSchema.optional(),
    title: z.string().trim().min(2).max(200),
    slug: slugSchema.optional(),
    brideName: z.string().trim().min(1).max(120),
    groomName: z.string().trim().min(1).max(120),
    eventDate: isoDateSchema.optional(),
    eventTime: z.string().trim().max(20).optional(),
    venueName: z.string().trim().max(200).optional(),
    venueAddress: z.string().trim().max(400).optional(),
    message: z.string().trim().max(3000).optional(),
    coverImage: safeHttpUrlSchema.nullable().optional(),
    status: z.enum(["Draft", "Published", "Active"]).default("Draft"),
  })
  .strict();

export const inviteUpdateSchema = inviteCreateSchema.partial().strict();

export const inviteGuestCreateSchema = z
  .object({
    guestName: z.string().trim().min(2).max(120),
    phone: z.string().trim().min(8).max(24).optional(),
    email: z.string().trim().email().optional(),
    relationship: z.string().trim().max(80).optional(),
  })
  .strict();

export const inviteRsvpCreateSchema = z
  .object({
    guestId: positiveIntIdSchema.optional(),
    guestName: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().optional(),
    response: z.enum(["Attending", "Declined", "Maybe"]),
    guestCount: z.coerce.number().int().min(1).max(20).default(1),
    message: z.string().trim().max(500).optional(),
  })
  .strict()
  .refine((d) => Boolean(d.guestId || d.guestName), {
    message: "Provide either guestId or guestName to record RSVP",
  });

// ── Payments ─────────────────────────────────────────────────────────────────
export const paymentIntentCreateSchema = z
  .object({
    bookingId: positiveIntIdSchema,
    amountInr: inrAmountSchema.positive("Payment amount must be greater than zero"),
    paymentMethod: z.enum(["upi", "card", "netbanking", "bank_transfer"]).default("upi"),
    couponCode: z.string().trim().min(2).max(40).optional(),
    idempotencyKey: z.string().trim().min(8).max(120),
  })
  .strict();

export const couponValidateSchema = z
  .object({
    couponCode: z.string().trim().min(2).max(40),
    amountInr: inrAmountSchema.positive(),
  })
  .strict();

export const refundCreateSchema = z
  .object({
    amountInr: inrAmountSchema.positive(),
    reason: z.string().trim().min(5).max(500),
  })
  .strict();

// ── Notifications & Conversations ────────────────────────────────────────────
export const notificationMarkReadSchema = z
  .object({
    notificationIds: z.array(positiveIntIdSchema).max(100).optional(),
    markAll: z.boolean().optional(),
  })
  .strict()
  .refine((d) => Boolean(d.markAll) || (d.notificationIds && d.notificationIds.length > 0), {
    message: "Specify notificationIds or set markAll=true",
  });

export const conversationCreateSchema = z
  .object({
    venueId: positiveIntIdSchema.optional(),
    vendorId: positiveIntIdSchema.optional(),
    subject: z.string().trim().min(2).max(200),
    initialMessage: z.string().trim().min(1).max(4000).optional(),
  })
  .strict();

export const messageCreateSchema = z
  .object({
    message: z.string().trim().min(1).max(4000),
    messageType: z.enum(["text", "image", "file"]).default("text"),
    attachments: z
      .array(
        z.object({
          fileName: z.string().trim().min(1).max(180),
          fileUrl: safeHttpUrlSchema,
          fileType: z.string().trim().max(120).optional(),
          fileSize: z.coerce.number().int().positive().max(25 * 1024 * 1024).optional(),
        })
      )
      .max(5)
      .optional(),
  })
  .strict();

export const notificationTemplateUpsertSchema = z
  .object({
    channel: z.enum(["in_app", "email", "sms"]),
    templateName: z.string().trim().min(2).max(120),
    titleOrSubject: z.string().trim().max(200).optional(),
    body: z.string().trim().min(2).max(8000),
    variables: z.array(z.string().trim()).optional(),
    status: z.enum(["Active", "Inactive"]).default("Active"),
  })
  .strict();

export const listQueryWithStatusSchema = paginationQuerySchema.extend({
  status: z.string().trim().max(60).optional(),
});

