import { fail, ok } from "@/services/http/response";
import { requireAuthenticatedUser } from "@/services/auth";

export async function GET() {
  try {
    const ctx = await requireAuthenticatedUser();
    return ok({
      id: ctx.userId,
      email: ctx.email,
      fullName: ctx.fullName,
      phone: ctx.phone,
      role: ctx.role,
      vendorId: ctx.vendorId,
      isActiveAdmin: ctx.isActiveAdmin,
      isConciergeOrAdmin: ctx.isConciergeOrAdmin,
    });
  } catch (err) {
    return fail(err, "Failed to load current user.");
  }
}

