import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Anything under /admin requires sign-in. Everything else (public website
// + /api routes used by the public site) stays open.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // Subdomain routing: visits to app.ajcommercialgroup.com should always land
  // on the admin (which Clerk then bounces to sign-in if not authenticated).
  // The "app." subdomain is ONLY for the admin tool — the public website
  // lives on the apex (ajcommercialgroup.com).
  const isAppSubdomain = host.startsWith("app.");
  if (isAppSubdomain) {
    const allowed =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/assets") ||
      pathname.includes(".");
    if (!allowed) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  if (isAdminRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
