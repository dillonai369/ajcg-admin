import { NextResponse } from "next/server";
import { ensureAndGetUserAccess, setUserStatus, type AccessStatus } from "@/lib/access";

// PUT /api/users/[email]  body: { status: 'approved' | 'rejected' | 'pending' }
// Only callable by super admin.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  const me = await ensureAndGetUserAccess();
  if (!me) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  if (!me.is_super_admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);

  let body: { status?: AccessStatus };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const status = body.status;
  if (status !== "approved" && status !== "rejected" && status !== "pending") {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }

  // Safety: never let someone revoke themselves or another super admin
  if (email.toLowerCase().trim() === me.email) {
    return NextResponse.json({ error: "cannot change your own status" }, { status: 400 });
  }

  const updated = await setUserStatus(email, status, me.email);
  if (!updated) return NextResponse.json({ error: "user not found" }, { status: 404 });
  return NextResponse.json(updated);
}
