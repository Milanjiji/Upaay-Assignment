import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // Public paths that do not require authentication
  const isPublicPath = pathname === "/login" || pathname === "/register" || pathname === "/";

  // 1. If user is NOT authenticated and tries to access a protected path -> redirect to /login
  if (!token && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If user IS authenticated and tries to access /login or /register -> redirect to / (homepage)
  const isAuthPage = pathname === "/login" || pathname === "/register";
  if (token && isAuthPage) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Match all routes except internal assets, favicon, Next.js builds, or public assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - assets (images and static svg assets in public/assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|assets).*)",
  ],
};
