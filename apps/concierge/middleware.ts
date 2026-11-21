import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, getSupabasePublicEnv } from "@we-arrange/auth";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;
const PROTECTED_ROUTES = [
  "/",
  "/leads",
  "/analytics",
  "/venues",
  "/vendors",
  "/pages",
  "/settings",
];

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("/_next/") || pathname.startsWith("/api/") || STATIC_EXT_RE.test(pathname)) {
    return NextResponse.next();
  }

  const isLoginRoute = pathname === "/login";
  const isProtected = isProtectedPath(pathname);
  if (!isLoginRoute && !isProtected) {
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
    if (isLoginRoute) {
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, 307);
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
    if (isLoginRoute) {
      return response;
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl, 307);
  }

  const [{ data: userRow, error: userError }, { data: adminRow, error: adminError }] =
    await Promise.all([
      supabase
        .from("users")
        .select("user_id, role_id, status")
        .eq("user_id", user.id)
        .eq("status", "Active")
        .maybeSingle(),
      supabase
        .from("admins")
        .select("admin_id, status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  let isAuthorizedStaff = false;
  if (!userError && !adminError && userRow?.status === "Active") {
    if (adminRow?.status === "active") {
      isAuthorizedStaff = true;
    } else if (!adminRow && userRow.role_id) {
      const { data: roleRow, error: roleError } = await supabase
        .from("roles")
        .select("role_name, status")
        .eq("role_id", userRow.role_id)
        .maybeSingle();

      const roleName = roleRow?.role_name?.toLowerCase().trim();
      const isRoleActive = !roleRow?.status || roleRow.status === "Active";
      if (!roleError && isRoleActive && roleName === "concierge") {
        isAuthorizedStaff = true;
      }
    }
  }

  if (isLoginRoute) {
    if (isAuthorizedStaff) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
    return response;
  }

  if (!isAuthorizedStaff) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized_role");
    return NextResponse.redirect(loginUrl, 307);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
