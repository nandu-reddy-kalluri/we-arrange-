import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@we-arrange/auth";
import type { Database } from "@we-arrange/database/types";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.includes("/_next/") ||
    pathname.startsWith("/api/") ||
    STATIC_EXT_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Redirect legacy /admin paths to /concierge-portal
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const targetPath = pathname.replace(/^\/admin/, "/concierge-portal");
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Always allow public access to login screens without throwing on missing local env during static preview
  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicEnv());
  } catch {
    if (pathname.startsWith("/customer") || (pathname.startsWith("/concierge-portal") && pathname !== "/concierge-portal/login")) {
      return NextResponse.redirect(
        new URL(pathname.startsWith("/concierge-portal") ? "/concierge-portal/login" : "/login", request.url)
      );
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

  if (pathname.startsWith("/customer")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  if (pathname.startsWith("/concierge-portal")) {
    if (pathname === "/concierge-portal/login") {
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/concierge-portal/login", request.url));
    }

    // Verify DB-backed active admin or concierge role via RLS-enforced user session (never user_metadata)
    const { data: adminRow } = await supabase
      .from("admins")
      .select("admin_id, status")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (adminRow) {
      return response;
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("role_id, status")
      .eq("user_id", user.id)
      .eq("status", "Active")
      .maybeSingle();

    if (userRow?.role_id) {
      const { data: roleRow } = await supabase
        .from("roles")
        .select("role_name")
        .eq("role_id", userRow.role_id)
        .maybeSingle();

      const roleName = roleRow?.role_name?.toLowerCase();
      if (roleName === "admin" || roleName === "concierge") {
        return response;
      }
    }

    return NextResponse.redirect(new URL("/concierge-portal/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
