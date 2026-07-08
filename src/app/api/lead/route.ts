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

const GHL_WEBHOOK_URL =
  process.env.GHL_WEBHOOK_URL ||
  "https://services.leadconnectorhq.com/hooks/5VC5Crt63oAfFwA1RTHp/webhook-trigger/938c131b-d8f5-4da2-8a42-5f5fd4f6d060";

const MIN_FORM_FILL_MS = 2000;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const clientIp = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
  const userAgent = req.headers.get("user-agent") || null;

  // Bot check #1: honeypot
  if (body.website_url && String(body.website_url).trim().length > 0) {
    console.log("[bot drop] honeypot triggered", { ip: clientIp, form: body.form_type });
    return NextResponse.json({ ok: true });
  }

  // Bot check #2: minimum time on page
  const loadedAt = parseInt(String(body.__form_loaded_at ?? ""), 10);
  if (Number.isFinite(loadedAt) && loadedAt > 0) {
    if (Date.now() - loadedAt < MIN_FORM_FILL_MS) {
      console.log("[bot drop] time check failed", { ip: clientIp, form: body.form_type });
      return NextResponse.json({ ok: true });
    }
  }

  // Strip bot-protection fields before relaying
  const { website_url: _hp, __form_loaded_at: _t, ...cleanBody } = body;

  const enriched = {
    ...cleanBody,
    server_received_at: new Date().toISOString(),
    server_ip: clientIp,
    user_agent: userAgent,
  };

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
