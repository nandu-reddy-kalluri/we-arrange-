import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireConciergeOrAdmin } from "@/services/auth";
import { getPrivateVendorContactsForStaff } from "@/services/concierge/conciergeService";
import { fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const vendorId = positiveIntIdSchema.parse(id);
    const adminClient = createServiceRoleClient();
    const data = await getPrivateVendorContactsForStaff(adminClient, vendorId);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to load private vendor contacts.");
  }
}

