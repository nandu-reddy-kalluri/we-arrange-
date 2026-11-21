import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, getSupabasePublicEnv } from "@we-arrange/auth";

const STATIC_EXT_RE =
  /\.(?:js|jsx|ts|tsx|css|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|eot)$/i;
const PROTECTED_ROUTES = ["/", "/overview", "/users", "/catalog", "/moderation", "/settings"];
const ADMIN_LOGIN_ROUTES = ["/login", "/admin/login", "/login143", "/admin/login143"];

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAdminLoginPath(pathname: string) {
  return ADMIN_LOGIN_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("/_next/") || pathname.startsWith("/api/") || STATIC_EXT_RE.test(pathname)) {
    return NextResponse.next();
  }

  const isLoginRoute = isAdminLoginPath(pathname);
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
    return NextResponse.redirect(new URL("/login", request.url), 307);
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
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }

  const [{ data: userRow, error: userError }, { data: adminRow, error: adminError }] =
    await Promise.all([
      supabase
        .from("users")
        .select("user_id, status")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("admins")
        .select("admin_id, status")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  const isAuthorizedAdmin =
    !userError &&
    !adminError &&
    userRow?.status === "Active" &&
    adminRow?.status === "active";

  if (isLoginRoute) {
    if (isAuthorizedAdmin) {
      return NextResponse.redirect(new URL("/", request.url), 307);
    }
    return response;
  }

  if (!isAuthorizedAdmin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "unauthorized_role");
    return NextResponse.redirect(loginUrl, 307);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
