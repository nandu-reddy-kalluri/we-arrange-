import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, verifyAdminEmail, ADMIN_SESSION_COOKIE } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Admin email is required." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Master password is required." },
        { status: 400 }
      );
    }

    // Validate authorized administrator email
    if (!verifyAdminEmail(email)) {
      return NextResponse.json(
        { error: "Unauthorized admin email address." },
        { status: 401 }
      );
    }

    // Validate master admin password
    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Incorrect admin password. Please verify credentials." },
        { status: 401 }
      );
    }

    // Create session token
    const token = `ymwa_admin_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: "Server error during authentication." },
      { status: 500 }
    );
  }
}
