import { redirect } from "next/navigation";

// Sign-in page lives at /sign-in (top-level, no admin sidebar).
// This stub redirects /admin/sign-in → /sign-in to keep older Clerk env defaults working.
export default function AdminSignInRedirect() {
  redirect("/sign-in");
}
