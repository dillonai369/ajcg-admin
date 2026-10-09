import { NextRequest, NextResponse } from "next/server";
import { getInquiries } from "@/lib/data";
import { requireApproved } from "@/lib/access";
import { formTypeLabel } from "@/lib/lead-forms";
import { leadDetails, leadNote, statusLabel } from "@/lib/inquiry-ui";

/**
 * GET /api/inquiries/export?status=&type=&q= — admin only.
 * Streams every matching lead as CSV: fixed columns first, then one column
 * per distinct detail label found across the export, so a valuation's unit
 * count and a buyer's target areas each get their own column in Excel.
 */
function csvCell(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  // Neutralise spreadsheet formula injection, then quote.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;

  const sp = req.nextUrl.searchParams;
  const rows = await getInquiries({
    status: sp.get("status") || undefined,
    formType: sp.get("type") || undefined,
    search: sp.get("q") || undefined,
    limit: 2000,
  });

  const detailCols: string[] = [];
  const parsed = rows.map((r) => {
    const d = Object.fromEntries(leadDetails(r));
    for (const k of Object.keys(d)) if (!detailCols.includes(k)) detailCols.push(k);
    return { r, d };
  });

  const header = [
    "Received", "Name", "Email", "Phone", "Form", "Status", "Assigned to",
    "Listing", "Broker requested", "SMS consent", "Note", ...detailCols,
    "Internal notes", "Submitted from", "Referrer", "UTM source", "UTM medium", "UTM campaign", "ID",
  ];

  const lines = [header.map(csvCell).join(",")];
  for (const { r, d } of parsed) {
    lines.push(
      [
        r.created_at ? new Date(r.created_at).toLocaleString("en-US", { timeZone: "America/Chicago" }) : "",
        r.name, r.email, r.phone, formTypeLabel(r.form_type || r.source), statusLabel(r.status), r.assigned_to,
        r.property_slug, r.broker_slug, r.sms_consent ? "Yes" : "", leadNote(r),
        ...detailCols.map((c) => d[c] ?? ""),
        r.notes, r.page_url, r.referrer, r.utm_source, r.utm_medium, r.utm_campaign, r.id,
      ]
        .map(csvCell)
        .join(","),
    );
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(`﻿${lines.join("\r\n")}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ajcg-leads-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
