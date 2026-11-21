import { NextResponse } from "next/server";
import { AppError } from "@we-arrange/database/errors";
import { resolveAuthenticatedContext } from "@/services/auth";

export async function GET() {
  try {
    const ctx = await resolveAuthenticatedContext();
    if (!ctx.userId) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }
    if (!ctx.isActiveAdmin) {
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
  } catch (err) {
    const status = err instanceof AppError ? err.status : 401;
    return NextResponse.json({ authenticated: false, user: null }, { status });
  }
}
