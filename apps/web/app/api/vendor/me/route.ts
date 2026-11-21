import { NextRequest } from "next/server";
import { AppError } from "@we-arrange/database/errors";
import { vendorSelfUpdateSchema } from "@we-arrange/validation";
import {
  getOwnedVendorProfile,
  updateOwnedVendorProfile,
} from "@we-arrange/service-vendor";
import { requireVendorOwner } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

const RESTRICTED_VENDOR_FIELDS = [
  "is_verified",
  "isVerified",
  "status",
  "user_id",
  "userId",
  "vendor_id",
  "vendorId",
  "rating",
  "metadata",
] as const;

export async function GET() {
  try {
    const ctx = await requireVendorOwner();
    const profile = await getOwnedVendorProfile(ctx.supabase, ctx.vendorId);
    return ok(profile);
  } catch (err) {
    return fail(err, "Failed to load vendor dashboard profile.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireVendorOwner();
    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new AppError("VALIDATION_ERROR", 400, "Invalid JSON request body.");
    }

    const rawObj = raw as Record<string, unknown>;
    if (RESTRICTED_VENDOR_FIELDS.some((key) => key in rawObj)) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Vendors cannot modify verification status, ownership, or restricted administrative fields."
      );
    }

    const parsed = vendorSelfUpdateSchema.safeParse(rawObj);
    if (!parsed.success) {
      throw parsed.error;
    }

    const updated = await updateOwnedVendorProfile(
      ctx.supabase,
      ctx.vendorId,
      ctx.userId,
      parsed.data
    );
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update vendor profile.");
  }
}

