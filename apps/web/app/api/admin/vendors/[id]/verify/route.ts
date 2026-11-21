import { NextRequest } from "next/server";
import { adminVendorVerifySchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { adminVerifyVendor } from "@we-arrange/service-vendor";
import { requireActiveAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireActiveAdmin();
    const { id } = await context.params;
    const vendorId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, adminVendorVerifySchema);
    const adminClient = createServiceRoleClient();
    const verified = await adminVerifyVendor(adminClient, vendorId, body);

    await adminClient.from("moderation_logs").insert({
      moderator_id: admin.userId,
      action: body.isVerified ? "vendor_verified" : "vendor_unverified",
      remarks: body.remarks ?? `Vendor ${vendorId} is_verified=${body.isVerified}`,
    });

    return ok(verified);
  } catch (err) {
    return fail(err, "Failed to verify vendor.");
  }
}

