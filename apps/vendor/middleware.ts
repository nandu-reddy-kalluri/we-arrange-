import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, getSupabasePublicEnv } from "@we-arrange/auth";
import type { Database } from "@we-arrange/database/types";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;
const PROTECTED_PREFIXES = [
  "/",
  "/overview",
  "/profile",
  "/catalog",
  "/bookings",
  "/dashboard",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) =>
    prefix === "/" ? pathname === "/" : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

async function isActiveVendorOrAdmin(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string
): Promise<boolean> {
  const [{ data: userRow }, { data: adminRow }] = await Promise.all([
    supabase
      .from("users")
      .select("role_id, status")
      .eq("user_id", userId)
      .eq("status", "Active")
      .maybeSingle(),
    supabase
      .from("admins")
      .select("admin_id, status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!userRow) {
    return false;
  }

  const isActiveAdmin = Boolean(adminRow && adminRow.status === "active");
  if (isActiveAdmin) {
    return true;
  }

  const hasNonActiveAdminRecord = Boolean(adminRow && adminRow.status !== "active");
  if (hasNonActiveAdminRecord || !userRow.role_id) {
    return false;
  }

  const { data: roleRow } = await supabase
    .from("roles")
    .select("role_name, status")
    .eq("role_id", userRow.role_id)
    .maybeSingle();

  return Boolean(
    roleRow &&
      roleRow.status === "Active" &&
      roleRow.role_name?.toLowerCase() === "vendor"
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.includes("/_next/") ||
    pathname.startsWith("/api/") ||
    STATIC_EXT_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (!isAuthPage && !isProtectedPath(pathname)) {
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
    if (isAuthPage) {
      return response;
    }
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }

  const supabase = createServerClient<Database>(url, anonKey, {
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

  if (isAuthPage) {
    if (user && (await isActiveVendorOrAdmin(supabase, user.id))) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }

  const authorized = await isActiveVendorOrAdmin(supabase, user.id);
  if (!authorized) {
    const deniedUrl = new URL("/login", request.url);
    deniedUrl.searchParams.set("error", "unauthorized_role");
    return NextResponse.redirect(deniedUrl, 307);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
