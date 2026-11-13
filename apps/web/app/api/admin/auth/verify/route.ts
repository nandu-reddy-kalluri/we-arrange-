import { NextResponse } from "next/server";
import { resolveAuthenticatedContext } from "@/services/auth";

export async function GET() {
  try {
    const ctx = await resolveAuthenticatedContext();
    if (!ctx.isConciergeOrAdmin) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 403 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: ctx.userId,
        email: ctx.email,
        fullName: ctx.fullName,
        role: ctx.role,
        isActiveAdmin: ctx.isActiveAdmin,
      },
    });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
