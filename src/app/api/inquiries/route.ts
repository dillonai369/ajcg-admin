import { NextRequest, NextResponse } from "next/server";
import { createInquiry, getInquiries, logActivity } from "@/lib/data";
import { requireApproved } from "@/lib/access";

/**
 * POST /api/inquiries
 *
 * Called by the public site's contact / buyer / seller / 1031 / valuation forms
 * (assets/form-handler.js) to log an inquiry into Supabase. The same form also
 * posts to /api/lead, which relays to GoHighLevel — these two paths are
 * intentionally independent so a GHL outage doesn't block CRM writes here.
 *
 * GET /api/inquiries returns the 50 most recent inquiries, used by the admin
 * overview's "Recent inquiries" widget.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  try {
    const row = await createInquiry({
      name,
      email: typeof body.email === "string" ? body.email : undefined,
      phone: typeof body.phone === "string" ? body.phone : undefined,
      message: typeof body.message === "string" ? body.message : undefined,
      source: typeof body.source === "string" ? body.source : "website",
      property_slug: typeof body.property_slug === "string" ? body.property_slug : undefined,
      broker_slug: typeof body.broker_slug === "string" ? body.broker_slug : undefined,
      status: "new",
    });

    // Fire-and-forget audit log; ignore failures so a missing `activity` table
    // doesn't break form submissions.
    logActivity({
      kind: "inquiry.created",
      entity: row.id ? `inquiry:${row.id}` : "inquiry",
      summary: `New inquiry from ${name}`,
      metadata: { source: row.source, email: row.email, phone: row.phone },
    }).catch(() => {});

    return NextResponse.json(row, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/inquiries failed:", err);
    return NextResponse.json({ error: "Could not save inquiry" }, { status: 500 });
  }
}

// GET exposes lead PII (names, emails, phones) for the admin overview widget,
// so it must be gated. POST stays public — the site's forms submit to it.
export async function GET() {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const rows = await getInquiries();
  return NextResponse.json(rows);
}
