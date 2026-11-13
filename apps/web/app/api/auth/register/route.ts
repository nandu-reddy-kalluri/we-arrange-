import { NextRequest } from "next/server";
import { z } from "zod";
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

    const withType = "accountType" in raw ? raw : { ...raw, accountType: "customer" };
    const parsed = registerDispatchSchema.safeParse(withType);
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

