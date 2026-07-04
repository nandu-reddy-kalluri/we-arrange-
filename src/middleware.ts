import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Main middleware handler — Phase 1.5 will add Supabase session checks here
// See docs/architecture/auth-flow.md for the planned role-based guard implementation
export function middleware(request: NextRequest) {
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
