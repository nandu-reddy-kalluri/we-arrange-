import { NextRequest } from "next/server";
import { updateCustomerProfileSchema } from "@we-arrange/validation";
import { getCustomerProfile, updateCustomerProfile } from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    const ctx = await requireAuthenticatedUser();
    const profile = await getCustomerProfile(ctx.supabase, ctx.userId);
    return ok(profile);
  } catch (err) {
    return fail(err, "Failed to load customer profile.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, updateCustomerProfileSchema);
    const updated = await updateCustomerProfile(ctx.supabase, ctx.userId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update customer profile.");
  }
}

