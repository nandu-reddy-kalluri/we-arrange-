import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_EMAIL } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(ADMIN_SESSION_COOKIE);
  const isAuthenticated = Boolean(session?.value);

  return NextResponse.json({
    authenticated: isAuthenticated,
    user: isAuthenticated
      ? {
          email: ADMIN_EMAIL,
          role: "Chief Concierge Admin",
        }
      : null,
  });
}
