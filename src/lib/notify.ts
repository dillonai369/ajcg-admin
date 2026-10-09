/**
 * New-lead email notification via Resend's REST API (no SDK — one fetch).
 *
 * Fully env-gated: with no RESEND_API_KEY it logs once and does nothing, so
 * the lead endpoints behave identically whether or not email is set up.
 *
 * Env (set in BOTH Vercel projects):
 *   RESEND_API_KEY    — from resend.com
 *   LEAD_NOTIFY_TO    — comma-separated recipients, e.g. "joey@…, anthony@…"
 *   LEAD_NOTIFY_FROM  — a sender on a verified domain, e.g. "leads@ajcommercialgroup.com"
 *   ADMIN_BASE_URL    — optional, defaults to https://app.ajcommercialgroup.com
 */
import type { Inquiry } from "./data";
import { formTypeLabel, humanizeKey, formatDetailValue } from "./lead-forms";

let warnedOnce = false;

export function isNotifyConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.LEAD_NOTIFY_TO && process.env.LEAD_NOTIFY_FROM);
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function buildLeadEmail(lead: Inquiry): { subject: string; html: string; text: string } {
  const type = formTypeLabel(lead.form_type || lead.source);
  const base = process.env.ADMIN_BASE_URL || "https://app.ajcommercialgroup.com";
  const link = lead.id ? `${base}/admin/inquiries/${lead.id}` : `${base}/admin/inquiries`;

  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email || "—"],
    ["Phone", lead.phone || "—"],
    ["Form", type],
  ];
  if (lead.property_slug) rows.push(["Listing", lead.property_slug]);
  if (lead.broker_slug) rows.push(["Requested broker", lead.broker_slug]);
  for (const [k, v] of Object.entries(lead.details ?? {})) {
    const val = formatDetailValue(v);
    if (val.trim()) rows.push([humanizeKey(k), val]);
  }
  if (lead.sms_consent) rows.push(["SMS consent", "Yes"]);
  if (lead.page_url) rows.push(["Submitted from", lead.page_url]);

  // The visitor's own note is the first paragraph of `message` (before the
  // "Label: value" block), when they wrote one.
  const note = (lead.message || "").split("\n\n")[0]?.trim();
  const noteIsDetailLine = note && /^[A-Z][\w\s']*: /.test(note) && !note.includes("\n");

  const subject = `New ${type.toLowerCase()} lead: ${lead.name}`;

  const html = `
    <div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0f172a">
      <h2 style="margin:0 0 4px">New ${esc(type.toLowerCase())} lead</h2>
      <p style="margin:0 0 16px;color:#475569">Submitted ${esc(new Date(lead.created_at || Date.now()).toLocaleString("en-US", { timeZone: "America/Chicago" }))} CT</p>
      ${note && !noteIsDetailLine ? `<blockquote style="margin:0 0 16px;padding:12px 16px;background:#f8fafc;border-left:3px solid #c9a227;white-space:pre-wrap">${esc(note)}</blockquote>` : ""}
      <table style="border-collapse:collapse;width:100%">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 10px 6px 0;color:#64748b;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:6px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin:20px 0 0"><a href="${esc(link)}" style="display:inline-block;background:#0b1f3a;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Open in admin</a></p>
    </div>`;

  const text = [
    `New ${type.toLowerCase()} lead`,
    "",
    note && !noteIsDetailLine ? `"${note}"\n` : "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    `Open: ${link}`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  return { subject, html, text };
}

export async function notifyNewLead(lead: Inquiry): Promise<void> {
  if (!isNotifyConfigured()) {
    if (!warnedOnce) {
      warnedOnce = true;
      console.warn("Lead email not configured — set RESEND_API_KEY, LEAD_NOTIFY_TO, LEAD_NOTIFY_FROM to enable.");
    }
    return;
  }
  const to = (process.env.LEAD_NOTIFY_TO as string).split(",").map((s) => s.trim()).filter(Boolean);
  const { subject, html, text } = buildLeadEmail(lead);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.LEAD_NOTIFY_FROM,
      to,
      subject,
      html,
      text,
      reply_to: lead.email || undefined,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
}
