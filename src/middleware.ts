import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest, type NextFetchEvent } from "next/server";

// Anything under /admin requires sign-in.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

// Clerk's middleware only runs where authentication actually matters.
//
// Previously clerkMiddleware() wrapped EVERY request, including the public
// marketing site. That meant each public page hit Clerk's "handshake" flow:
// middleware answered `GET /` with a 307 redirect to `/?__clerk_handshake=...`
// and made an outbound call to api.clerk.com/v1/jwks before returning a page.
// Verified in Vercel logs 2026-09-09 on `/`, `/careers`, and property pages.
//
// Two real costs: (1) Search Console's crawl-stats showed ~29% of Googlebot's
// requests answered as temporary redirects instead of content, burning crawl
// budget on a site we're actively trying to get indexed; (2) every human
// visitor paid an extra round trip plus a Clerk API call before first byte.
//
// The public site never calls auth()/currentUser() (verified — no Clerk usage
// anywhere under src/app/(public)), so it does not need this middleware at all.
const needsClerk = createRouteMatcher([
  "/admin(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/pending-approval(.*)",
  "/api/(.*)",
]);

const ADMIN_HOST = "app.ajcommercialgroup.com";
const PUBLIC_HOSTS = new Set(["www.ajcommercialgroup.com", "ajcommercialgroup.com"]);
/** The only API routes the public website's forms call (see SmartForm.tsx). */
const PUBLIC_FORM_ENDPOINTS = new Set(["/api/inquiries", "/api/lead", "/api/resume"]);

const withClerk = clerkMiddleware(async (auth, req) => {
  // /admin/sign-in is only a redirect stub to /sign-in. It must stay public:
  // protecting it sends a signed-out visitor from /admin → /admin/sign-in →
  // /admin/sign-in … forever wherever the sign-in URL setting still points
  // at it (seen on the www project's preview, 2026-11-20).
  if (isAdminRoute(req) && !req.nextUrl.pathname.startsWith("/admin/sign-in")) {
    await auth.protect();
  }
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const { pathname } = req.nextUrl;

  // Subdomain routing: visits to app.ajcommercialgroup.com should always land
  // on the admin (which Clerk then bounces to sign-in if not authenticated).
  // The "app." subdomain is ONLY for the admin tool — the public website
  // lives on the apex (ajcommercialgroup.com). This is a plain host check and
  // deliberately does not need Clerk to run.
  if (host.startsWith("app.")) {
    const allowed =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/pending-approval") ||
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

  // The PUBLIC hosts (www / apex) must not be a second way into the admin.
  //
  // The same code deploys to two Vercel projects. Only the app. project holds
  // the production login keys; the www project still carries Clerk
  // *development* keys. That left www.ajcommercialgroup.com/admin and the
  // admin APIs reachable behind a dev-mode login in front of the production
  // database. Nobody is meant to sign in there, so on the public hosts:
  //   • admin / sign-in pages redirect to the real admin on app.
  //   • every API call except the three the public forms use returns 404.
  // Previews (*.vercel.app) and localhost are untouched.
  if (PUBLIC_HOSTS.has(host)) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/sign-in") ||
      pathname.startsWith("/sign-up") ||
      pathname.startsWith("/pending-approval")
    ) {
      return NextResponse.redirect(`https://${ADMIN_HOST}${pathname}${req.nextUrl.search}`);
    }
    if (pathname.startsWith("/api/")) {
      const isPublicForm = req.method === "POST" && PUBLIC_FORM_ENDPOINTS.has(pathname.replace(/\/$/, ""));
      if (!isPublicForm && req.method !== "OPTIONS") {
        return NextResponse.json({ error: "not found" }, { status: 404 });
      }
    }
  }

  if (needsClerk(req)) {
    return withClerk(req, event);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|.*\\..*).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
