import { NextRequest } from "next/server";
import { vendorContactsUpsertSchema } from "@we-arrange/validation";
import { getOwnedVendorProfile, upsertOwnedVendorContacts } from "@we-arrange/service-vendor";
import { requireVendorOwner } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    const ctx = await requireVendorOwner();
    const profile = await getOwnedVendorProfile(ctx.supabase, ctx.vendorId);
    return ok(profile.contacts);
  } catch (err) {
    return fail(err, "Failed to load vendor contacts.");
  }
}

export async function PUT(request: NextRequest) {
  try {
    const ctx = await requireVendorOwner();
    const body = await parseJsonBody(request, vendorContactsUpsertSchema);
    const contacts = await upsertOwnedVendorContacts(ctx.supabase, ctx.vendorId, body);
    return ok(contacts);
  } catch (err) {
    return fail(err, "Failed to update vendor contacts.");
  }
}

