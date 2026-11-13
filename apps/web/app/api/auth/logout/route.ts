import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@we-arrange/auth";
import { fail, ok } from "@/services/http/response";
import { logoutSession } from "@/services/auth";

export async function POST() {
  try {
    const data = await logoutSession();
    const res: NextResponse = ok(data);
    res.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (err) {
    return fail(err, "Failed to log out.");
  }
}

