import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, getSupabasePublicEnv } from "@we-arrange/auth";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;
const PROTECTED_PREFIXES = ["/overview", "/saved", "/bookings", "/settings", "/customer"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.includes("/_next/") ||
    pathname.startsWith("/api/") ||
    STATIC_EXT_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const publicBase = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_MARKETPLACE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/+$/, "");
  const universalLoginUrl = `${publicBase}/login`;

  if (pathname === "/login") {
    return NextResponse.redirect(new URL(universalLoginUrl, request.url));
  }
  if (pathname === "/register") {
    return NextResponse.redirect(new URL(`${universalLoginUrl}?mode=signup`, request.url));
  }

  const isProtected =
    pathname === "/" ||
    PROTECTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );
  if (!isProtected) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicEnv());
  } catch {
    return NextResponse.redirect(new URL(universalLoginUrl, request.url));
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(universalLoginUrl, request.url));
  }

  const [{ data: userRow }, { data: adminRow }] = await Promise.all([
    supabase
      .from("users")
      .select("role_id, status")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("admins")
      .select("admin_id, status")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!userRow || userRow.status !== "Active") {
    return NextResponse.redirect(new URL(`${universalLoginUrl}?error=account_inactive`, request.url));
  }

  if (adminRow?.status === "active") {
    return NextResponse.redirect(new URL(`${publicBase}/admin`, request.url));
  }

  if (userRow.role_id) {
    const { data: roleRow } = await supabase
      .from("roles")
      .select("role_name, status")
      .eq("role_id", userRow.role_id)
      .maybeSingle();

    const roleName = roleRow?.role_name?.toLowerCase().trim();
    const isRoleActive = !roleRow?.status || roleRow.status === "Active";
    if (isRoleActive && roleName === "vendor") {
      return NextResponse.redirect(new URL(`${publicBase}/vendor`, request.url));
    }
    if (isRoleActive && roleName === "concierge" && !adminRow) {
      return NextResponse.redirect(new URL(`${publicBase}/concierge-portal`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
