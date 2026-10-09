/**
 * POST /api/lead
 *
 * Server-to-server relay from the public site's forms to GoHighLevel. The
 * browser can't reliably POST cross-origin to GHL (CORS preflight), so forms
 * post here (same origin) and this route relays the payload to the GHL webhook.
 *
 * This restores the relay that the old static site had at /api/lead.js — the
 * Next.js app was missing it, so SmartForm's POST to /api/lead was 404ing and
 * leads were only landing in Supabase (/api/inquiries), not GoHighLevel.
 *
 * Bot protection (ported from the static function):
 *   1. Honeypot field "website_url" — any value means a bot; drop silently.
 *   2. Minimum-time check — submissions <2s after page load are bots.
 * In both cases we return 200 so the bot thinks it succeeded and stops retrying.
 *
 * The webhook URL lives in the GHL_WEBHOOK_URL env var (set it in Vercel). A
 * fallback to the known URL keeps the relay working if the env var is missing.
 */
import { NextResponse } from "next/server";
import { screenSubmission, clientIpFrom } from "@/lib/spam";

// Read the webhook from the environment only — no hardcoded fallback. The URL
// is set as GHL_WEBHOOK_URL in both Vercel projects (ajcg-admin + ajcg-app).
// Keeping a live secret in source is what we're removing here.
const GHL_WEBHOOK_URL = process.env.GHL_WEBHOOK_URL;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const clientIp = clientIpFrom(req.headers);
  const userAgent = req.headers.get("user-agent") || null;

  // Screening now lives in src/lib/spam.ts so this relay and /api/inquiries
  // apply the exact same rules — previously only this route screened anything,
  // so junk that skipped the relay still reached the admin inbox.
  // Bots get a 200 so they think it worked and stop retrying.
  const verdict = screenSubmission({
    honeypot: body.website_url,
    formElapsedMs: body.__form_elapsed_ms,
    formLoadedAt: body.__form_loaded_at,
    name: typeof body.name === "string" ? body.name : "",
    email: typeof body.email === "string" ? body.email : "",
    phone: typeof body.phone === "string" ? body.phone : "",
    message: typeof body.message === "string" ? body.message : "",
    ip: clientIp,
  });
  if (verdict.spam) {
    console.log("[bot drop]", verdict.reason, { ip: clientIp, form: body.form_type });
    return NextResponse.json({ ok: true });
  }

  // Strip bot-protection fields before relaying
  const { website_url: _hp, __form_loaded_at: _t, __form_elapsed_ms: _e, ...cleanBody } = body;

  const enriched = {
    ...cleanBody,
    server_received_at: new Date().toISOString(),
    server_ip: clientIp,
    user_agent: userAgent,
  };

  // Fail closed if the webhook isn't configured, rather than silently dropping
  // the lead. The SmartForm still records the inquiry via /api/inquiries, and
  // surfaces the phone/email fallback on this non-ok response.
  if (!GHL_WEBHOOK_URL) {
    console.error("GHL_WEBHOOK_URL is not set — cannot relay lead to GoHighLevel");
    return NextResponse.json({ ok: false, error: "relay_unconfigured" }, { status: 500 });
  }

  try {
    const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
    });
    if (!ghlResponse.ok) {
      console.error("GHL responded non-2xx:", ghlResponse.status);
      return NextResponse.json({ ok: false, error: "ghl_upstream" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to relay to GHL:", err);
    return NextResponse.json({ ok: false, error: "relay_failed" }, { status: 500 });
  }
}
