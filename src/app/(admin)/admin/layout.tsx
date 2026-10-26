import "../../globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { ensureAndGetUserAccess } from "@/lib/access";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Clerk middleware has already enforced sign-in for /admin/*.
  // Now layer on the admin-approval gate: only `approved` users get in.
  const access = await ensureAndGetUserAccess();
  if (!access) {
    redirect("/sign-in");
  }
  if (access.status !== "approved") {
    redirect("/pending-approval");
  }

  // ClerkProvider lives here (not in the root layout) so the public site
  // doesn't ship Clerk's JS — see src/app/layout.tsx.
  return (
    <ClerkProvider>
      <div className="flex min-h-screen">
        <Sidebar isSuperAdmin={access.is_super_admin} />
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
      </div>
    </ClerkProvider>
  );
}
