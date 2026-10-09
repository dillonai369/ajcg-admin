import { after, NextRequest, NextResponse } from "next/server";
import { getInquiry, updateInquiry, deleteInquiry, logActivity, INQUIRY_STATUSES } from "@/lib/data";
import { requireApproved } from "@/lib/access";

type Ctx = { params: Promise<{ id: string }> };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(_req: NextRequest, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  const row = await getInquiry(id);
  if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(row);
}

/**
 * PATCH /api/inquiries/:id — update workflow fields only.
 * Body: { status?, assigned_to?, notes? }
 * Lead content (name, details, message) is immutable: it's what the visitor
 * actually sent, and the brokers need to be able to trust that.
 */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patch: { status?: string; assigned_to?: string; notes?: string } = {};
  if (typeof body.status === "string") {
    if (!(INQUIRY_STATUSES as readonly string[]).includes(body.status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }
  if (typeof body.assigned_to === "string") patch.assigned_to = body.assigned_to.trim();
  if (typeof body.notes === "string") patch.notes = body.notes.slice(0, 20000);

  try {
    const row = await updateInquiry(id, patch);
    if (!row) return NextResponse.json({ error: "not found" }, { status: 404 });
    const actor = gate.user.email;
    after(() =>
      logActivity({
        kind: "inquiry.updated",
        entity: `inquiry:${id}`,
        actor,
        summary: `${actor} updated lead ${row.name}${patch.status ? ` → ${patch.status}` : ""}`,
        metadata: patch,
      }).catch(() => {}),
    );
    return NextResponse.json(row);
  } catch (err) {
    console.error("PATCH /api/inquiries/:id failed:", err);
    return NextResponse.json({ error: "Could not update inquiry" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "not found" }, { status: 404 });
  try {
    const ok = await deleteInquiry(id);
    if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
    const actor = gate.user.email;
    after(() =>
      logActivity({ kind: "inquiry.deleted", entity: `inquiry:${id}`, actor, summary: `${actor} deleted a lead` }).catch(() => {}),
    );
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/inquiries/:id failed:", err);
    return NextResponse.json({ error: "Could not delete inquiry" }, { status: 500 });
  }
}
