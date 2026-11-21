import { NextRequest } from "next/server";
import {
  positiveIntIdSchema,
  vendorFaqSchema,
  vendorPackageSchema,
  vendorPricingSchema,
  vendorServiceSchema,
  vendorSocialLinkSchema,
  vendorTeamMemberSchema,
  venueAvailabilityCreateSchema,
  venueMediaCreateSchema,
  venueMediaUploadSignSchema,
} from "@we-arrange/validation";
import { mapDatabaseError } from "@we-arrange/database/errors";
import { requireVendorOwner } from "@/services/auth";
import { AppError, created, fail, ok } from "@/services/http/response";
import { createSignedMediaUploadUrl } from "@/services/storage/mediaAdapter";

type ResourceConfig = {
  table:
    | "vendor_services"
    | "vendor_pricing"
    | "vendor_packages"
    | "vendor_gallery"
    | "vendor_videos"
    | "vendor_faq"
    | "vendor_availability"
    | "vendor_social_links"
    | "vendor_team";
  pk: string;
  mapInsert: (vendorId: number, raw: unknown) => Record<string, unknown>;
};

const RESOURCE_MAP: Record<string, ResourceConfig> = {
  services: {
    table: "vendor_services",
    pk: "service_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorServiceSchema.parse(raw);
      return { vendor_id: vendorId, service_name: p.serviceName, description: p.description ?? null };
    },
  },
  pricing: {
    table: "vendor_pricing",
    pk: "pricing_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorPricingSchema.parse(raw);
      return {
        vendor_id: vendorId,
        service_name: p.serviceName,
        price: p.price,
        price_unit: p.priceUnit ?? null,
        currency: "INR",
      };
    },
  },
  packages: {
    table: "vendor_packages",
    pk: "package_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorPackageSchema.parse(raw);
      return {
        vendor_id: vendorId,
        package_name: p.packageName,
        description: p.description ?? null,
        price: p.price,
        currency: "INR",
      };
    },
  },
  gallery: {
    table: "vendor_gallery",
    pk: "gallery_id",
    mapInsert: (vendorId, raw) => {
      const p = venueMediaCreateSchema.parse(raw);
      return {
        vendor_id: vendorId,
        media_url: p.mediaUrl,
        media_type: "image",
        is_cover: p.isCover,
        sort_order: p.sortOrder,
      };
    },
  },
  videos: {
    table: "vendor_videos",
    pk: "video_id",
    mapInsert: (vendorId, raw) => {
      const p = venueMediaCreateSchema.parse(raw);
      return {
        vendor_id: vendorId,
        video_url: p.mediaUrl,
        title: p.title ?? null,
        sort_order: p.sortOrder,
      };
    },
  },
  faq: {
    table: "vendor_faq",
    pk: "faq_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorFaqSchema.parse(raw);
      return {
        vendor_id: vendorId,
        question: p.question,
        answer: p.answer,
        sort_order: p.sortOrder,
      };
    },
  },
  availability: {
    table: "vendor_availability",
    pk: "availability_id",
    mapInsert: (vendorId, raw) => {
      const p = venueAvailabilityCreateSchema.parse(raw);
      return {
        vendor_id: vendorId,
        available_from: p.availableFrom,
        available_to: p.availableTo,
        is_booked: p.isBooked,
      };
    },
  },
  "social-links": {
    table: "vendor_social_links",
    pk: "social_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorSocialLinkSchema.parse(raw);
      return { vendor_id: vendorId, platform: p.platform, url: p.url };
    },
  },
  team: {
    table: "vendor_team",
    pk: "team_id",
    mapInsert: (vendorId, raw) => {
      const p = vendorTeamMemberSchema.parse(raw);
      return {
        vendor_id: vendorId,
        name: p.name,
        role: p.role,
        photo: p.photo ?? null,
      };
    },
  },
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const ctx = await requireVendorOwner();
    const { resource } = await context.params;
    const cfg = RESOURCE_MAP[resource];
    if (!cfg) throw new AppError("NOT_FOUND", 404, "Unknown vendor resource.");

    const { data, error } = await ctx.supabase
      .from(cfg.table)
      .select("*")
      .eq("vendor_id", ctx.vendorId);
    if (error) throw mapDatabaseError(error, `Failed to load vendor ${resource}.`);
    return ok(data ?? []);
  } catch (err) {
    return fail(err, "Failed to load vendor resource.");
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const ctx = await requireVendorOwner();
    const { resource } = await context.params;
    const cfg = RESOURCE_MAP[resource];
    if (!cfg) throw new AppError("NOT_FOUND", 404, "Unknown vendor resource.");

    const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;
    if ((resource === "gallery" || resource === "videos") && raw && "fileName" in raw && "contentType" in raw) {
      const signReq = venueMediaUploadSignSchema.parse(raw);
      return ok(
        createSignedMediaUploadUrl({
          scope: "vendors",
          ownerId: ctx.vendorId,
          fileName: signReq.fileName,
          contentType: signReq.contentType,
          fileSizeBytes: signReq.fileSizeBytes,
        })
      );
    }

    const row = cfg.mapInsert(ctx.vendorId, raw);
    const { data, error } = await ctx.supabase
      .from(cfg.table)
      .insert(row as never)
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, `Failed to create vendor ${resource}.`);
    return created(data);
  } catch (err) {
    return fail(err, "Failed to save vendor resource.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ resource: string }> }
) {
  try {
    const ctx = await requireVendorOwner();
    const { resource } = await context.params;
    const cfg = RESOURCE_MAP[resource];
    if (!cfg) throw new AppError("NOT_FOUND", 404, "Unknown vendor resource.");

    const idParam = request.nextUrl.searchParams.get("id");
    const itemId = positiveIntIdSchema.parse(idParam);

    const { data, error } = await ctx.supabase
      .from(cfg.table)
      .delete()
      .eq(cfg.pk as never, itemId)
      .eq("vendor_id", ctx.vendorId)
      .select("*")
      .maybeSingle();
    if (error) throw mapDatabaseError(error, `Failed to delete vendor ${resource}.`);
    if (!data) throw new AppError("NOT_FOUND", 404, "Resource record not found.");
    return ok({ deleted: true, id: itemId });
  } catch (err) {
    return fail(err, "Failed to delete vendor resource.");
  }
}

