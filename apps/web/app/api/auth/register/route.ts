import { NextRequest } from "next/server";
import { z } from "zod";
import { AppError } from "@we-arrange/database/errors";
import { registerSchema, vendorRegisterSchema } from "@we-arrange/validation";
import {
  created,
  fail,
  logApiEvent,
} from "@/services/http/response";
import {
  registerCustomerAccount,
  registerVendorAccount,
} from "@/services/auth";

const registerDispatchSchema = z.discriminatedUnion("accountType", [
  vendorRegisterSchema.extend({ accountType: z.literal("vendor") }),
  registerSchema.extend({ accountType: z.literal("customer") }),
]);

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => null);
    if (!raw || typeof raw !== "object") {
      return fail(registerSchema.safeParse(raw).error);
    }

    const rawObj = raw as Record<string, unknown>;
    const requestedRole =
      typeof rawObj.role === "string" ? rawObj.role.toLowerCase().trim() : undefined;
    const requestedType =
      typeof rawObj.type === "string" ? rawObj.type.toLowerCase().trim() : undefined;
    const requestedAccountType =
      typeof rawObj.accountType === "string" ? rawObj.accountType.toLowerCase().trim() : undefined;
    const requestedPortal =
      typeof rawObj.portal === "string" ? rawObj.portal.toLowerCase().trim() : undefined;

    const hasPrivilegeFields =
      "roleId" in rawObj ||
      "role_id" in rawObj ||
      "isActiveAdmin" in rawObj ||
      "isVerified" in rawObj ||
      "is_verified" in rawObj ||
      "status" in rawObj ||
      "vendorId" in rawObj ||
      "vendor_id" in rawObj;

    const isVendorRegistration =
      requestedAccountType === "vendor" ||
      requestedType === "vendor" ||
      requestedPortal === "vendor";

    const invalidRoleForVendor =
      isVendorRegistration &&
      ((requestedRole !== undefined && requestedRole !== "vendor") ||
        (requestedAccountType !== undefined && requestedAccountType !== "vendor") ||
        (requestedType !== undefined && requestedType !== "vendor"));

    const invalidRoleForCustomer =
      !isVendorRegistration &&
      ((requestedRole !== undefined && requestedRole !== "customer") ||
        (requestedType !== undefined && requestedType !== "customer") ||
        (requestedAccountType !== undefined && requestedAccountType !== "customer") ||
        (requestedPortal !== undefined && requestedPortal !== "customer"));

    if (hasPrivilegeFields || invalidRoleForVendor || invalidRoleForCustomer) {
      return fail(
        new AppError(
          "FORBIDDEN",
          403,
          isVendorRegistration
            ? "Vendor registration cannot assign admin, concierge, customer, or elevated roles."
            : "Customer registration cannot assign admin, concierge, vendor, or elevated roles."
        )
      );
    }

    const sanitized = { ...rawObj };
    delete sanitized.role;
    delete sanitized.type;
    delete sanitized.portal;
    sanitized.accountType = isVendorRegistration ? "vendor" : "customer";

    const parsed = registerDispatchSchema.safeParse(sanitized);
    if (!parsed.success) {
      return fail(parsed.error);
    }

    const result =
      parsed.data.accountType === "vendor"
        ? await registerVendorAccount(parsed.data)
        : await registerCustomerAccount(parsed.data);

    logApiEvent({
      route: "/api/auth/register",
      method: "POST",
      userId: result.userId,
      status: 201,
    });
    return created(result);
  } catch (err) {
    logApiEvent({
      route: "/api/auth/register",
      method: "POST",
      status: 400,
    });
    return fail(err, "Registration failed.");
  }
}

