import Link from "next/link";
import { Download, Inbox } from "lucide-react";
import { getInquiries, getBrokers, INQUIRY_STATUSES, type Inquiry } from "@/lib/data";
import { FORM_TYPES, formTypeLabel } from "@/lib/lead-forms";
import { statusPill, statusLabel, formatWhen, leadSummary } from "@/lib/inquiry-ui";

export const dynamic = "force-dynamic";

/**
 * Lead inbox. Every form submission from the public site lands here with a
 * date, the form it came from, the listing or broker it was about, and a
 * status the team can actually change. Replaces the old 6-row dashboard
 * widget that showed 120 characters of a text blob and nothing else.
 */
export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? (sp[k] as string[])[0] : (sp[k] as string | undefined)) || "";
  const status = one("status");
  const type = one("type");
  const q = one("q");

  const [inquiries, brokers] = await Promise.all([
    getInquiries({ status: status || undefined, formType: type || undefined, search: q || undefined }).catch(
      () => [] as Inquiry[],
    ),
    getBrokers().catch(() => []),
  ]);
  const brokerName = (slug?: string) => brokers.find((b) => b.slug === slug)?.name || slug || "";

  const exportQs = new URLSearchParams();
  if (status) exportQs.set("status", status);
  if (type) exportQs.set("type", type);
  if (q) exportQs.set("q", q);

  const newCount = inquiries.filter((i) => (i.status || "new") === "new").length;

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Inquiries</h1>
          <p className="text-sm text-slate-500">
            {inquiries.length} lead{inquiries.length === 1 ? "" : "s"}
            {newCount ? ` · ${newCount} new` : ""}
            {status || type || q ? " · filtered" : ""}
          </p>
        </div>
        <a
          href={`/api/inquiries/export${exportQs.toString() ? `?${exportQs}` : ""}`}
          className="btn-ghost text-sm px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" /> Export CSV
        </a>
      </header>

      <div className="p-8">
        <form method="get" className="card p-4 mb-5 flex flex-wrap items-end gap-3">
          <div className="min-w-[220px] flex-1">
            <label className="field-label">Search</label>
            <input className="field-input" name="q" defaultValue={q} placeholder="Name, email, phone, or anything they wrote" />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" name="status" defaultValue={status}>
              <option value="">All</option>
              {INQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>{statusLabel(s)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">Form</label>
            <select className="field-input" name="type" defaultValue={type}>
              <option value="">All</option>
              {Object.entries(FORM_TYPES).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary text-sm px-4 py-2 rounded-lg">Filter</button>
          {status || type || q ? (
            <Link href="/admin/inquiries" className="text-sm text-slate-500 underline px-2 py-2">Clear</Link>
          ) : null}
        </form>

        <div className="card overflow-hidden">
          {inquiries.length === 0 ? (
            <div className="px-6 py-14 text-center text-slate-500">
              <Inbox className="w-8 h-8 mx-auto mb-3 text-slate-300" />
              <div className="font-medium text-slate-700">No leads{status || type || q ? " match these filters" : " yet"}</div>
              <div className="text-sm mt-1">Every form on ajcommercialgroup.com lands here the moment it&apos;s submitted.</div>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Received</th>
                  <th className="text-left font-medium px-5 py-3">Lead</th>
                  <th className="text-left font-medium px-5 py-3">Form</th>
                  <th className="text-left font-medium px-5 py-3">About</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3">Assigned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50 align-top">
                    <td className="px-5 py-3 whitespace-nowrap text-slate-500">{formatWhen(q.created_at)}</td>
                    <td className="px-5 py-3">
                      <Link href={`/admin/inquiries/${q.id}`} className="font-medium hover:underline">
                        {q.name}
                      </Link>
                      <div className="text-xs text-slate-500">
                        {q.email}{q.email && q.phone ? " · " : ""}{q.phone}
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">{formTypeLabel(q.form_type || q.source)}</td>
                    <td className="px-5 py-3 text-slate-600 max-w-[360px]">
                      {q.property_slug ? (
                        <Link href={`/admin/listings/${q.property_slug}`} className="underline decoration-slate-300">
                          {q.property_slug}
                        </Link>
                      ) : null}
                      {q.property_slug && q.broker_slug ? " · " : ""}
                      {q.broker_slug ? <span>for {brokerName(q.broker_slug)}</span> : null}
                      {!q.property_slug && !q.broker_slug ? (
                        <span className="line-clamp-2">{leadSummary(q)}</span>
                      ) : null}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`pill ${statusPill(q.status)}`}>{statusLabel(q.status)}</span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600">{q.assigned_to ? brokerName(q.assigned_to) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
