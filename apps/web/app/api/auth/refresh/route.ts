import { NextRequest } from "next/server";
import { refreshSessionSchema } from "@we-arrange/validation";
import { fail, ok } from "@/services/http/response";
import { refreshSession } from "@/services/auth";

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json().catch(() => ({}));
    const parsed = refreshSessionSchema.safeParse(raw);
    if (!parsed.success) {
      return fail(parsed.error);
    }

    const result = await refreshSession(parsed.data.refreshToken);
    return ok(result);
  } catch (err) {
    return fail(err, "Failed to refresh session.");
  }
}

