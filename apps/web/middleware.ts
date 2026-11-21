import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@we-arrange/auth";
import type { Database } from "@we-arrange/database/types";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;

type ResolvedRole = "customer" | "vendor" | "concierge" | "admin" | "inactive";

async function resolveMiddlewareAccess(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string
): Promise<{ isActiveAdmin: boolean; role: ResolvedRole }> {
  const [{ data: userRow }, { data: adminRow }] = await Promise.all([
    supabase
      .from("users")
      .select("role_id, status")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("admins")
      .select("admin_id, status")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!userRow || userRow.status !== "Active") {
    return { isActiveAdmin: false, role: "inactive" };
  }

  const isActiveAdmin = Boolean(adminRow && adminRow.status === "active");
  if (isActiveAdmin) {
    return { isActiveAdmin: true, role: "admin" };
  }

  const hasNonActiveAdmin = Boolean(adminRow && adminRow.status !== "active");
  if (userRow.role_id) {
    const { data: roleRow } = await supabase
      .from("roles")
      .select("role_name, status")
      .eq("role_id", userRow.role_id)
      .maybeSingle();

    const roleName = roleRow?.role_name?.toLowerCase().trim();
    const isRoleActive = !roleRow?.status || roleRow.status === "Active";
    if (isRoleActive) {
      if (!hasNonActiveAdmin && roleName === "concierge") {
        return { isActiveAdmin: false, role: "concierge" };
      }
      if (roleName === "vendor") {
        return { isActiveAdmin: false, role: "vendor" };
      }
    }
  }

  return { isActiveAdmin: false, role: "customer" };
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

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Fail closed on protected portal routes when Supabase env vars are missing
  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicEnv());
  } catch {
    if (pathname.startsWith("/customer")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (
      (pathname === "/vendor" || pathname.startsWith("/vendor/")) &&
      pathname !== "/vendor/login" &&
      pathname !== "/vendor/register"
    ) {
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }
    if (pathname.startsWith("/admin") && pathname !== "/admin/login" && pathname !== "/admin/login143") {
      return NextResponse.redirect(new URL("/admin/login143", request.url));
    }
    if (pathname.startsWith("/concierge-portal") && pathname !== "/concierge-portal/login") {
      return NextResponse.redirect(new URL("/concierge-portal/login", request.url));
    }
    return response;
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
          request: {
            headers: request.headers,
          },
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

  // CUSTOMER LOGIN
  if (pathname === "/login") {
    if (user) {
      const access = await resolveMiddlewareAccess(supabase, user.id);
      if (access.role === "customer") {
        return NextResponse.redirect(new URL("/customer/overview", request.url));
      }
      if (access.role === "vendor") {
        return NextResponse.redirect(new URL("/vendor", request.url));
      }
      if (access.isActiveAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      if (access.role === "concierge") {
        return NextResponse.redirect(new URL("/concierge-portal", request.url));
      }
    }
    return response;
  }

  // PARTNER / VENDOR LOGIN
  if (pathname === "/partner/login") {
    if (user) {
      const access = await resolveMiddlewareAccess(supabase, user.id);
      if (access.role === "vendor") {
        return NextResponse.redirect(new URL("/vendor", request.url));
      }
    }
    return response;
  }

  // CUSTOMER PORTAL
  if (pathname.startsWith("/customer")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const access = await resolveMiddlewareAccess(supabase, user.id);
    if (access.role === "vendor") {
      return NextResponse.redirect(new URL("/vendor", request.url));
    }
    if (access.role === "concierge") {
      return NextResponse.redirect(new URL("/concierge-portal", request.url));
    }
    if (access.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (access.role === "inactive") {
      return NextResponse.redirect(new URL("/login?error=account_inactive", request.url));
    }
    return response;
  }

  // VENDOR PORTAL (Strictly /vendor or /vendor/*, NEVER public /vendors)
  const isVendorPortal = pathname === "/vendor" || pathname.startsWith("/vendor/");
  if (isVendorPortal) {
    const isVendorAuth = pathname === "/vendor/login" || pathname === "/vendor/register";

    if (!user) {
      if (isVendorAuth) return response;
      return NextResponse.redirect(new URL("/partner/login", request.url));
    }

    const access = await resolveMiddlewareAccess(supabase, user.id);
    const isAuthorizedVendor = access.role === "vendor" || access.isActiveAdmin;

    if (isVendorAuth) {
      if (isAuthorizedVendor) {
        return NextResponse.redirect(new URL("/vendor", request.url));
      }
      return response;
    }

    if (!isAuthorizedVendor) {
      return NextResponse.redirect(new URL("/partner/login?error=unauthorized_role", request.url));
    }

    return response;
  }

  // ADMIN PORTAL (Secret path: /admin/login143, preserved /admin/login)
  if (pathname.startsWith("/admin")) {
    const isAdminLogin = pathname === "/admin/login" || pathname === "/admin/login143";

    if (!user) {
      if (isAdminLogin) return response;
      return NextResponse.redirect(new URL("/admin/login143", request.url));
    }

    const access = await resolveMiddlewareAccess(supabase, user.id);

    if (isAdminLogin) {
      if (access.isActiveAdmin) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return response;
    }

    if (!access.isActiveAdmin) {
      return NextResponse.redirect(new URL("/admin/login143?error=unauthorized_role", request.url));
    }

    return response;
  }

  // CONCIERGE PORTAL
  if (pathname.startsWith("/concierge-portal")) {
    const isConciergeLogin = pathname === "/concierge-portal/login";

    if (!user) {
      if (isConciergeLogin) return response;
      return NextResponse.redirect(new URL("/concierge-portal/login", request.url));
    }

    const access = await resolveMiddlewareAccess(supabase, user.id);
    const isAuthorizedStaff = access.isActiveAdmin || access.role === "concierge";

    if (isConciergeLogin) {
      if (isAuthorizedStaff) {
        return NextResponse.redirect(new URL("/concierge-portal", request.url));
      }
      return response;
    }

    if (!isAuthorizedStaff) {
      return NextResponse.redirect(new URL("/concierge-portal/login?error=unauthorized_role", request.url));
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
