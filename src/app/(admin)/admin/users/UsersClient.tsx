"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, ShieldCheck, Clock, Ban } from "lucide-react";
import type { UserAccess } from "@/lib/access";

export default function UsersClient({ users, myEmail }: { users: UserAccess[]; myEmail: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [list, setList] = useState<UserAccess[]>(users);

  async function setStatus(email: string, status: "approved" | "rejected" | "pending") {
    setBusy(email);
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error(await r.text());
      const updated = (await r.json()) as UserAccess;
      setList((prev) => prev.map((u) => (u.email === email ? updated : u)));
      router.refresh();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : "unknown error"}`);
    } finally {
      setBusy(null);
    }
  }

  const pending = list.filter((u) => u.status === "pending");
  const approved = list.filter((u) => u.status === "approved");
  const rejected = list.filter((u) => u.status === "rejected");

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-semibold">Users</h1>
        <p className="text-sm text-slate-500">
          Approve or reject access to the admin. Pre-approved emails (founders) are pre-seeded.
        </p>
      </header>

      <div className="p-8 space-y-8">
        {/* Pending */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            Pending approval ({pending.length})
          </h2>
          <div className="card overflow-hidden">
            {pending.length === 0 ? (
              <div className="px-5 py-6 text-sm text-slate-500 text-center">No pending requests.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-5 py-3 font-medium">Name & Email</th>
                    <th className="text-left px-5 py-3 font-medium">Requested</th>
                    <th className="text-right px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pending.map((u) => (
                    <tr key={u.email}>
                      <td className="px-5 py-3">
                        <div className="font-medium">{u.full_name || u.email.split("@")[0]}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {u.requested_at ? new Date(u.requested_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setStatus(u.email, "approved")}
                          disabled={busy === u.email}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                          style={{ background: "#059669" }}
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => setStatus(u.email, "rejected")}
                          disabled={busy === u.email}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Approved */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            Approved ({approved.length})
          </h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name & Email</th>
                  <th className="text-left px-5 py-3 font-medium">Approved</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approved.map((u) => {
                  const isMe = u.email === myEmail;
                  return (
                    <tr key={u.email}>
                      <td className="px-5 py-3">
                        <div className="font-medium">
                          {u.full_name || u.email.split("@")[0]}
                          {isMe ? <span className="ml-2 pill pill-blue">you</span> : null}
                        </div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {u.approved_at ? new Date(u.approved_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-5 py-3">
                        {u.is_super_admin ? (
                          <span className="pill pill-purple inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Super admin
                          </span>
                        ) : (
                          <span className="pill pill-gray">Admin</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isMe || u.is_super_admin ? (
                          <span className="text-xs text-slate-400">—</span>
                        ) : (
                          <button
                            onClick={() => setStatus(u.email, "rejected")}
                            disabled={busy === u.email}
                            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50"
                          >
                            <Ban className="w-3.5 h-3.5" /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Rejected */}
        {rejected.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-600" />
              Blocked ({rejected.length})
            </h2>
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-slate-100">
                  {rejected.map((u) => (
                    <tr key={u.email}>
                      <td className="px-5 py-3">
                        <div className="font-medium">{u.full_name || u.email.split("@")[0]}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setStatus(u.email, "approved")}
                          disabled={busy === u.email}
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                        >
                          <Check className="w-3.5 h-3.5" /> Unblock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
