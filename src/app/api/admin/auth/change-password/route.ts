import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPassword,
  setAdminPassword,
  ADMIN_SESSION_COOKIE,
} from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE);
    if (!session?.value) {
      return NextResponse.json(
        { error: "Unauthorized access." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required." },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(currentPassword)) {
      return NextResponse.json(
        { error: "Current password does not match our records." },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password and confirmation do not match." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    setAdminPassword(newPassword);

    const response = NextResponse.json({
      success: true,
      message: "Admin password updated successfully. Session invalidated, please log in with your new password.",
    });

    // Invalidate current session and log out
    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Server error updating password." },
      { status: 500 }
    );
  }
}
