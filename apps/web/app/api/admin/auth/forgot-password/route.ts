import { NextRequest, NextResponse } from "next/server";
import { requestPasswordResetOtp } from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Registered admin email is required." },
        { status: 400 }
      );
    }

    const result = requestPasswordResetOtp(email);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, cooldownRemaining: result.cooldownRemaining },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification OTP sent to registered admin email.",
      cooldownSeconds: 60,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process forgot password request." },
      { status: 500 }
    );
  }
}
