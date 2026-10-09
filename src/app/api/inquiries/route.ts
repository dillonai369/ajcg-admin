import { after, NextRequest, NextResponse } from "next/server";
import { createInquiry, getInquiries, logActivity, type Inquiry } from "@/lib/data";
import { requireApproved } from "@/lib/access";
import { screenSubmission, clientIpFrom } from "@/lib/spam";
import { FORM_TYPES, humanizeKey } from "@/lib/lead-forms";
import { notifyNewLead } from "@/lib/notify";

/**
 * POST /api/inquiries — public. Called by SmartForm on every lead form.
 *
 * Writes a structured inquiry row (name/email/phone in columns, every other
 * field in `details` jsonb, plus form type, page, referrer, UTM, consent) and
 * then notifies the brokers by email if RESEND_API_KEY is configured.
 *
 * GET /api/inquiries — admin only. Returns leads for the inbox, with optional
 * ?status=, ?type=, ?q= filters.
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);
  const formType = str(body.form_type) || str(body.source) || "contact";
  const details =
    body.details && typeof body.details === "object" && !Array.isArray(body.details)
      ? (body.details as Record<string, unknown>)
      : {};

  if (!name) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ error: "Please enter an email address or phone number so we can reach you." }, { status: 400 });
  }

  // Per-form essentials. The browser enforces `required` too; this is the
  // safety net for anything that skips the form and posts straight here.
  for (const key of FORM_TYPES[formType]?.requiredDetails ?? []) {
    const v = details[key];
    const present = Array.isArray(v) ? v.some((x) => String(x).trim()) : String(v ?? "").trim().length > 0;
    if (!present) {
      return NextResponse.json({ error: `Please fill in: ${humanizeKey(key)}.` }, { status: 400 });
    }
  }

  // Screen before writing. This endpoint is public by necessity (the site's
  // forms post to it), which also means anything on the internet can POST to
  // it directly — that is where junk leads in the admin inbox came from.
  // Bots get a 201-shaped success so they stop retrying and don't learn which
  // check caught them; nothing is written.
  const ip = clientIpFrom(req.headers);
  const verdict = screenSubmission({
    honeypot: body.website_url,
    formElapsedMs: body.__form_elapsed_ms,
    formLoadedAt: body.__form_loaded_at,
    name,
    email,
    phone,
    message,
    ip,
  });
  if (verdict.spam) {
    console.log("[inquiry drop]", verdict.reason, { ip, form: formType });
    return NextResponse.json({ ok: true, id: null }, { status: 201 });
  }

  const inquiry: Inquiry = {
    name,
    email: email || undefined,
    phone: phone || undefined,
    message: message || undefined,
    source: formType,
    form_type: formType,
    details,
    page_url: str(body.page_url) || undefined,
    referrer: str(body.referrer) || undefined,
    utm_source: str(body.utm_source) || undefined,
    utm_medium: str(body.utm_medium) || undefined,
    utm_campaign: str(body.utm_campaign) || undefined,
    utm_content: str(body.utm_content) || undefined,
    sms_consent: body.sms_consent === true || body.sms_consent === "true" || body.sms_consent === "on",
    property_slug: str(body.property_slug) || undefined,
    broker_slug: str(body.broker_slug) || undefined,
    resume_path: str(body.resume_path) || undefined,
    status: "new",
  };

  try {
    const row = await createInquiry(inquiry);

    // Audit log + broker email run AFTER the response is sent, via Next's
    // after(): the visitor isn't kept waiting on Resend, and Vercel keeps the
    // function alive until these finish (a bare fire-and-forget promise can be
    // killed the moment the response goes out). Failures are logged, never
    // surfaced — the lead is already saved.
    after(async () => {
      await Promise.allSettled([
        logActivity({
          kind: "inquiry.created",
          entity: row.id ? `inquiry:${row.id}` : "inquiry",
          actor: "Visitor",
          summary: `New ${formType.replace(/_/g, " ")} lead from ${name}`,
          metadata: { form_type: formType, email: row.email, phone: row.phone },
        }),
        notifyNewLead(row).catch((err) => console.error("notifyNewLead failed:", err)),
      ]);
    });

    return NextResponse.json({ ok: true, id: row.id ?? null }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/inquiries failed:", err);
    return NextResponse.json({ error: "Could not save inquiry" }, { status: 500 });
  }
}

// GET exposes lead PII (names, emails, phones) for the admin inbox, so it must
// be gated. POST stays public — the site's forms submit to it.
export async function GET(req: NextRequest) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const sp = req.nextUrl.searchParams;
  try {
    const rows = await getInquiries({
      status: sp.get("status") || undefined,
      formType: sp.get("type") || undefined,
      search: sp.get("q") || undefined,
      limit: Math.min(parseInt(sp.get("limit") || "500", 10) || 500, 2000),
    });
    return NextResponse.json(rows);
  } catch (err) {
    console.error("GET /api/inquiries failed:", err);
    return NextResponse.json({ error: "Could not load inquiries" }, { status: 500 });
  }
}
