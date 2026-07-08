/**
 * Access-gate helpers.
 *
 * Admin sign-in is open to anyone via Clerk, but actually USING the admin
 * requires being marked `approved` in the `user_access` table.
 * - On first sign-in, a `pending` row is inserted for the user.
 * - The super admin (Dillon) can approve / reject pending users via /admin/users.
 * - Pre-seeded entries (Dillon, Joey, Anthony) are already `approved`.
 */
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase";

export type AccessStatus = "pending" | "approved" | "rejected";

export type UserAccess = {
  email: string;
  status: AccessStatus;
  is_super_admin: boolean;
  requested_at: string;
  approved_at?: string | null;
  approved_by?: string | null;
  full_name?: string | null;
};

/**
 * Get the signed-in user's email + best-effort full name from Clerk.
 * Returns null if not signed in.
 */
export async function getClerkIdentity(): Promise<{ email: string; fullName?: string } | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await currentUser();
  const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase().trim();
  if (!email) return null;
  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    undefined;
  return { email, fullName };
}

/**
 * Look up the signed-in user's access row. Creates a `pending` row on first sign-in.
 * Returns null only if not signed in.
 */
export async function ensureAndGetUserAccess(): Promise<UserAccess | null> {
  const id = await getClerkIdentity();
  if (!id) return null;
  const sb = supabaseAdmin();

  // Look up existing
  const { data: existing, error: readErr } = await sb
    .from("user_access")
    .select("*")
    .eq("email", id.email)
    .maybeSingle();
  if (readErr) throw readErr;
  if (existing) {
    // Backfill full_name if we now know it
    if (!existing.full_name && id.fullName) {
      await sb.from("user_access").update({ full_name: id.fullName }).eq("email", id.email);
      existing.full_name = id.fullName;
    }
    return existing as UserAccess;
  }

  // Not found → insert as pending
  const insert = {
    email: id.email,
    status: "pending" as AccessStatus,
    is_super_admin: false,
    full_name: id.fullName ?? null,
  };
  const { data: row, error: insErr } = await sb
    .from("user_access")
    .insert(insert)
    .select("*")
    .single();
  if (insErr) throw insErr;
  return row as UserAccess;
}

/**
 * API auth guard. Call at the top of any route that must be admin-only.
 * Returns the caller's access row if they are signed in AND approved,
 * otherwise returns a ready-to-send NextResponse (401/403) in `.response`.
 *
 * Usage:
 *   const gate = await requireApproved();
 *   if (gate.response) return gate.response;
 *   // ...gate.user is the approved UserAccess
 */
export async function requireApproved(): Promise<
  { user: UserAccess; response: null } | { user: null; response: Response }
> {
  let me: UserAccess | null = null;
  try {
    me = await ensureAndGetUserAccess();
  } catch {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: "auth check failed" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      }),
    };
  }
  if (!me) {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    };
  }
  if (me.status !== "approved") {
    return {
      user: null,
      response: new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "content-type": "application/json" },
      }),
    };
  }
  return { user: me, response: null };
}

/** Just read the row, never insert. Used by the API. */
export async function getUserAccess(email: string): Promise<UserAccess | null> {
  const { data, error } = await supabaseAdmin()
    .from("user_access")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();
  if (error) throw error;
  return (data as UserAccess) ?? null;
}

/** Used by the /admin/users page (super admin only). */
export async function listAllUserAccess(): Promise<UserAccess[]> {
  const { data, error } = await supabaseAdmin()
    .from("user_access")
    .select("*")
    .order("requested_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as UserAccess[];
}

/** Used by the API to change another user's status. */
export async function setUserStatus(
  email: string,
  status: AccessStatus,
  approvedByEmail: string,
): Promise<UserAccess | null> {
  // Safety: never allow changing another super admin's status. Only the DB
  // seed can mint a super admin, and they must not be demotable via the API.
  const target = await getUserAccess(email);
  if (target?.is_super_admin) {
    throw new Error("cannot change another super admin's status");
  }

  const patch: Partial<UserAccess> = {
    status,
    approved_at: status === "approved" ? new Date().toISOString() : null,
    approved_by: status === "approved" ? approvedByEmail : null,
  };
  const { data, error } = await supabaseAdmin()
    .from("user_access")
    .update(patch)
    .eq("email", email.toLowerCase().trim())
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return (data as UserAccess) ?? null;
}
