import Link from "next/link";
import { Sparkles, Image as ImageIcon, Mail, Webhook, ShieldCheck } from "lucide-react";
import { listAllUserAccess, ensureAndGetUserAccess } from "@/lib/access";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isNotifyConfigured } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Settings. Shows what is actually connected — computed from environment
 * configuration and the user_access table — instead of a hard-coded list of
 * "Pending" services and notification toggles that weren't wired to anything.
 */
export default async function SettingsPage() {
  const [me, users] = await Promise.all([
    ensureAndGetUserAccess().catch(() => null),
    listAllUserAccess().catch(() => []),
  ]);
  const approved = users.filter((u) => u.status === "approved");
  const pending = users.filter((u) => u.status === "pending");

  const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";
  const clerkMode = clerkKey.startsWith("pk_live_") ? "live" : clerkKey.startsWith("pk_test_") ? "test" : "missing";

  const services: Array<{
    name: string;
    what: string;
    icon: React.ComponentType<{ className?: string }>;
    ok: boolean;
    status: string;
    note?: string;
  }> = [
    {
      name: "Supabase",
      what: "Listings, brokers, posts, leads, image storage",
      icon: ImageIcon,
      ok: isSupabaseConfigured,
      status: isSupabaseConfigured ? "Connected" : "Not configured",
    },
    {
      name: "GoHighLevel",
      what: "Every website lead is relayed to the GHL workflow",
      icon: Webhook,
      ok: Boolean(process.env.GHL_WEBHOOK_URL),
      status: process.env.GHL_WEBHOOK_URL ? "Connected" : "Not configured",
      note: process.env.GHL_WEBHOOK_URL ? undefined : "Set GHL_WEBHOOK_URL in Vercel.",
    },
    {
      name: "Lead email alerts",
      what: "Email to the team the moment a lead comes in",
      icon: Mail,
      ok: isNotifyConfigured(),
      status: isNotifyConfigured() ? `On → ${process.env.LEAD_NOTIFY_TO}` : "Off",
      note: isNotifyConfigured() ? undefined : "Set RESEND_API_KEY, LEAD_NOTIFY_TO and LEAD_NOTIFY_FROM in Vercel to turn on.",
    },
    {
      name: "Claude (Anthropic)",
      what: "AI drafting for blog posts and listing copy",
      icon: Sparkles,
      ok: Boolean(process.env.ANTHROPIC_API_KEY),
      status: process.env.ANTHROPIC_API_KEY ? "Connected" : "Not configured",
    },
    {
      name: "Sign-in (Clerk)",
      what: "Who can log in to this admin",
      icon: ShieldCheck,
      ok: clerkMode === "live",
      status: clerkMode === "live" ? "Production" : clerkMode === "test" ? "Development keys" : "Missing",
      note: clerkMode === "test" ? "Running on a development instance — switch to production keys." : undefined,
    },
  ];

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Team access and connected services</p>
      </header>

      <div className="p-8 space-y-4 max-w-3xl">
        <div className="card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-1">Team members</h3>
              <p className="text-xs text-slate-500">
                {approved.length} with access{pending.length ? ` · ${pending.length} waiting for approval` : ""}
              </p>
            </div>
            {me?.is_super_admin ? (
              <Link href="/admin/users" className="text-sm underline text-slate-600">Manage</Link>
            ) : null}
          </div>
          <div className="space-y-3">
            {approved.length === 0 ? (
              <p className="text-sm text-slate-500">No approved users found.</p>
            ) : (
              approved.map((u) => {
                const name = u.full_name || u.email.split("@")[0];
                const initials = name.split(/[\s.]+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
                return (
                  <div key={u.email} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-semibold">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{name}</div>
                      <div className="text-xs text-slate-500 truncate">{u.email}</div>
                    </div>
                    <span className={`pill ${u.is_super_admin ? "pill-purple" : "pill-blue"}`}>{u.is_super_admin ? "Owner" : "Admin"}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-1">Connected services</h3>
          <p className="text-xs text-slate-500 mb-4">Checked live from this deployment&apos;s configuration</p>
          <div className="space-y-1">
            {services.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.name} className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-slate-500">{s.what}</div>
                    {s.note ? <div className="text-xs text-amber-700 mt-0.5">{s.note}</div> : null}
                  </div>
                  <span className={`pill ${s.ok ? "pill-green" : "pill-amber"} truncate max-w-[220px]`}>{s.status}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-1">Where things live</h3>
          <ul className="text-sm text-slate-700 space-y-1.5">
            <li>Website &amp; admin hosting: Vercel (projects <code className="text-xs bg-slate-100 px-1 rounded">ajcg-admin</code>, <code className="text-xs bg-slate-100 px-1 rounded">ajcg-app</code>)</li>
            <li>Domain &amp; DNS: GoDaddy · Email: Microsoft 365 via GoDaddy</li>
            <li>Search: Google Search Console + Google Business Profile</li>
          </ul>
        </div>
      </div>
    </>
  );
}
