import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Main middleware handler — Phase 1.5 will add Supabase session checks here
// See docs/architecture/auth-flow.md for the planned role-based guard implementation
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy /admin routes to /concierge-portal
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const targetPath = pathname.replace(/^\/admin/, "/concierge-portal");
    return NextResponse.redirect(new URL(targetPath, request.url));
  }

  // Intercept Concierge Portal routes
  if (pathname.startsWith("/concierge-portal")) {
    const sessionCookie = request.cookies.get("ymwa_admin_session");
    const isAuthenticated = Boolean(sessionCookie?.value);

    // Always permit direct access to the login screen without auto-redirecting to dashboard
    if (pathname === "/concierge-portal/login") {
      return NextResponse.next();
    }

    // If not authenticated, redirect all /concierge-portal and /concierge-portal/* routes to /concierge-portal/login
    if (!isAuthenticated) {
      const loginUrl = new URL("/concierge-portal/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which paths middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
