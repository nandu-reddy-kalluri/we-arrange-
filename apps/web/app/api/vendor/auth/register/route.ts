import { NextRequest } from "next/server";
import { AppError } from "@we-arrange/database/errors";
import { vendorRegisterSchema } from "@we-arrange/validation";
import { created, fail, logApiEvent } from "@/services/http/response";
import { registerVendorAccount } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return fail(vendorRegisterSchema.safeParse(raw).error);
    }

    const rawObj = raw as Record<string, unknown>;
    const requestedRole =
      typeof rawObj.role === "string" ? rawObj.role.toLowerCase().trim() : undefined;
    const requestedType =
      typeof rawObj.type === "string" ? rawObj.type.toLowerCase().trim() : undefined;
    const requestedAccountType =
      typeof rawObj.accountType === "string" ? rawObj.accountType.toLowerCase().trim() : undefined;

    if (
      (requestedRole !== undefined && requestedRole !== "vendor") ||
      (requestedType !== undefined && requestedType !== "vendor") ||
      (requestedAccountType !== undefined && requestedAccountType !== "vendor") ||
      "roleId" in rawObj ||
      "role_id" in rawObj ||
      "isActiveAdmin" in rawObj ||
      "isVerified" in rawObj ||
      "is_verified" in rawObj ||
      "status" in rawObj ||
      "vendorId" in rawObj ||
      "vendor_id" in rawObj
    ) {
      return fail(
        new AppError(
          "FORBIDDEN",
          403,
          "Vendor registration cannot assign customer, admin, concierge, or elevated roles."
        )
      );
    }

    const sanitized = { ...rawObj };
    delete sanitized.role;
    delete sanitized.type;
    delete sanitized.accountType;
    delete sanitized.portal;

    const parsed = vendorRegisterSchema.safeParse(sanitized);
    if (!parsed.success) {
      return fail(parsed.error);
    }

    const result = await registerVendorAccount(parsed.data);

    logApiEvent({
      route: "/api/vendor/auth/register",
      method: "POST",
      userId: result.userId,
      status: 201,
    });
    return created(result);
  } catch (err) {
    logApiEvent({
      route: "/api/vendor/auth/register",
      method: "POST",
      status: 400,
    });
    return fail(err, "Vendor registration failed.");
  }
}
