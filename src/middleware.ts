import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Everything under /admin requires sign-in. Everything else (the public
// website + the /api routes used by the public site like /api/inquiries)
// stays open.
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
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
