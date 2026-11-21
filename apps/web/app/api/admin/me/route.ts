import { requireActiveAdmin } from "@/services/auth";
import { fail, ok } from "@/services/http/response";

export async function GET() {
  try {
    const auth = await requireActiveAdmin();
    return ok({
      userId: auth.userId,
      email: auth.email,
      roleName: auth.role,
      isActiveAdmin: auth.isActiveAdmin,
    });
  } catch (err) {
    return fail(err, "Failed to verify admin context.");
  }
}
