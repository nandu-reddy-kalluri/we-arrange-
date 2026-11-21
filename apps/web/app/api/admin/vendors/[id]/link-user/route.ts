import { NextRequest } from "next/server";
import { adminVendorLinkSchema, positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { adminLinkVendorUser } from "@we-arrange/service-vendor";
import { requireActiveAdmin } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireActiveAdmin();
    const { id } = await context.params;
    const vendorId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, adminVendorLinkSchema);
    const adminClient = createServiceRoleClient();
    const linked = await adminLinkVendorUser(adminClient, vendorId, body.userId);
    return ok(linked);
  } catch (err) {
    return fail(err, "Failed to link user to vendor.");
  }
}

