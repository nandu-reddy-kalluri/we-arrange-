import { NextRequest, NextResponse } from "next/server";
import { resetAdminPasswordWithToken } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resetToken, newPassword, confirmPassword } = body;

    if (!resetToken) {
      return NextResponse.json(
        { error: "Reset session token is missing." },
        { status: 400 }
      );
    }

    if (!newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation are required." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    if (newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const result = resetAdminPasswordWithToken(resetToken, newPassword);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Admin password reset successfully. Please log in with your new password.",
    });

    // Invalidate session cookie so login is required
    response.cookies.set({
      name: "ymwa_admin_session",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Failed to reset password." },
      { status: 500 }
    );
  }
}
