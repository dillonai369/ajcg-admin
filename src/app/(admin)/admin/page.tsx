import Link from "next/link";
import { Mail, Building2, FileText, UsersRound, Inbox, Activity } from "lucide-react";
import { getBrokers, getProperties, getPosts, getInquiries, getRecentActivity, type Inquiry } from "@/lib/data";
import { getClerkIdentity } from "@/lib/access";
import { formTypeLabel } from "@/lib/lead-forms";
import { statusPill, statusLabel, formatWhen, leadSummary } from "@/lib/inquiry-ui";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";

/**
 * Overview. Everything on this page is computed from the database — the
 * previous version mixed real counts with hard-coded traffic numbers, a fake
 * "Top pages" list and an invented lead in the activity feed. A client
 * reading made-up figures as real is worse than an empty card, so anything
 * we can't measure yet simply isn't shown.
 */
export default async function OverviewPage() {
  const [identity, brokers, properties, posts, inquiries, activity] = await Promise.all([
    getClerkIdentity().catch(() => null),
    getBrokers(),
    getProperties(),
    getPosts(),
    getInquiries({ limit: 1000 }).catch(() => [] as Inquiry[]),
    getRecentActivity(8).catch(() => []),
  ]);

  const firstName = identity?.fullName?.split(" ")[0] || identity?.email?.split("@")[0] || "there";
  const hour = Number(new Date().toLocaleString("en-US", { timeZone: "America/Chicago", hour: "numeric", hour12: false }));
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const activeStatuses = new Set(["for sale", "under contract", "coming soon"]);
  const activeListings = properties.filter((p) => activeStatuses.has((p.status || "").toLowerCase())).length;
  const soldListings = properties.filter((p) => (p.status || "").toLowerCase() === "sold").length;
  const publishedPosts = posts.filter((p) => (p.status || "").toLowerCase() === "published").length;
  const newInquiries = inquiries.filter((i) => (i.status || "new") === "new").length;

  // Leads over the last 30 days, by the form they came from.
  const since30 = Date.now() - 30 * 24 * 3600 * 1000;
  const recent30 = inquiries.filter((i) => i.created_at && new Date(i.created_at).getTime() >= since30);
  const byType = new Map<string, number>();
  for (const i of recent30) {
    const t = formTypeLabel(i.form_type || i.source);
    byType.set(t, (byType.get(t) ?? 0) + 1);
  }
  const typeRows = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const typeMax = Math.max(1, ...typeRows.map(([, n]) => n));

  // Leads per week, last 8 weeks (oldest → newest).
  const weekMs = 7 * 24 * 3600 * 1000;
  const weeks = Array.from({ length: 8 }, (_, idx) => {
    // idx 7 = the week ending now; idx 0 = eight weeks ago.
    const end = Date.now() - (7 - idx) * weekMs;
    const start = end - weekMs;
    const n = inquiries.filter((i) => {
      const t = i.created_at ? new Date(i.created_at).getTime() : 0;
      return t >= start && t < end;
    }).length;
    return { label: new Date(start).toLocaleDateString("en-US", { month: "short", day: "numeric" }), n };
  });
  const weekMax = Math.max(1, ...weeks.map((w) => w.n));

  const activityIcon = (kind: string) => {
    if (kind.startsWith("inquiry")) return { Icon: Mail, color: "bg-amber-100 text-amber-700" };
    if (kind.startsWith("post")) return { Icon: FileText, color: "bg-blue-100 text-blue-700" };
    if (kind.startsWith("broker")) return { Icon: UsersRound, color: "bg-purple-100 text-purple-700" };
    if (kind.startsWith("listing") || kind.startsWith("property")) return { Icon: Building2, color: "bg-emerald-100 text-emerald-700" };
    return { Icon: Activity, color: "bg-slate-100 text-slate-600" };
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{greeting}, {firstName}</h1>
          <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening on ajcommercialgroup.com</p>
        </div>
        {newInquiries > 0 ? (
          <Link href="/admin/inquiries?status=new" className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
            <Inbox className="w-4 h-4" /> {newInquiries} new lead{newInquiries === 1 ? "" : "s"}
          </Link>
        ) : null}
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Listings"
            value={properties.length}
            icon={Building2}
            hint={`${soldListings} sold · ${activeListings} active`}
          />
          <StatCard
            label="Leads"
            value={inquiries.length}
            icon={Mail}
            hint={`${newInquiries} new · ${recent30.length} in last 30 days`}
          />
          <StatCard
            label="Brokers"
            value={brokers.length}
            icon={UsersRound}
            hint={`${brokers.filter((b) => b.is_partner).length} partners`}
          />
          <StatCard
            label="Blog Posts"
            value={publishedPosts}
            icon={FileText}
            hint={`${posts.length - publishedPosts} draft${posts.length - publishedPosts === 1 ? "" : "s"}`}
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Leads per week — last 8 weeks</h3>
              <span className="text-xs text-slate-500">{inquiries.length === 0 ? "" : `${weeks.reduce((a, w) => a + w.n, 0)} total`}</span>
            </div>
            {inquiries.length === 0 ? (
              <p className="text-sm text-slate-500">No leads recorded yet.</p>
            ) : (
              <div className="flex items-end gap-2" style={{ height: 180 }}>
                {weeks.map((w) => (
                  <div key={w.label} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div className="text-xs text-slate-600 mb-1">{w.n || ""}</div>
                    <div
                      className="w-full rounded-t"
                      style={{ background: "var(--navy)", height: `${Math.max(4, (w.n / weekMax) * 130)}px`, opacity: w.n ? 1 : 0.15 }}
                    />
                    <div className="text-[10px] text-slate-400 mt-1 whitespace-nowrap">{w.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Leads by form — last 30 days</h3>
            {typeRows.length === 0 ? (
              <p className="text-sm text-slate-500">Nothing in the last 30 days.</p>
            ) : (
              <div className="space-y-3">
                {typeRows.map(([label, n]) => (
                  <div key={label} className="text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{label}</span>
                      <span className="text-slate-600">{n}</span>
                    </div>
                    <div className="h-1.5 rounded bg-slate-100">
                      <div className="h-1.5 rounded" style={{ width: `${(n / typeMax) * 100}%`, background: "var(--gold)" }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-sm">Recent activity</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {activity.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-500 text-center">
                  Activity will show here as leads arrive and content is updated.
                </div>
              ) : (
                activity.map((row) => {
                  const { Icon, color } = activityIcon(row.kind);
                  return (
                    <div key={row.id || `${row.kind}-${row.created_at}`} className="px-5 py-3 flex items-center gap-3 text-sm">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{row.summary || row.kind}</div>
                        <div className="text-xs text-slate-500">{row.actor || "System"}</div>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">{formatWhen(row.created_at)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-sm">Recent inquiries</h3>
              <Link href="/admin/inquiries" className="text-xs text-slate-500 hover:text-slate-800">View all →</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {inquiries.length === 0 ? (
                <div className="px-5 py-6 text-sm text-slate-500 text-center">
                  No inquiries yet. They&apos;ll appear here as soon as someone submits a form on the site.
                </div>
              ) : (
                inquiries.slice(0, 6).map((q) => (
                  <Link key={q.id || q.email} href={`/admin/inquiries/${q.id}`} className="block px-5 py-3 text-sm hover:bg-slate-50">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="font-medium">{q.name}</div>
                      <span className={`pill ${statusPill(q.status)}`}>{statusLabel(q.status)}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-1">
                      {formTypeLabel(q.form_type || q.source)} · {formatWhen(q.created_at)}
                      {q.property_slug ? ` · ${q.property_slug}` : ""}
                    </div>
                    {leadSummary(q) ? <div className="text-xs text-slate-600 line-clamp-2">{leadSummary(q)}</div> : null}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
