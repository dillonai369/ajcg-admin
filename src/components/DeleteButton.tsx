"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

/**
 * Permanent-delete control for the admin editors (listing / broker / post).
 *
 * The DELETE API routes have existed since the first build, but no editor ever
 * had a button that called them — the only way to remove a record was to ask a
 * developer (Mary, 2026-11: "I'm not sure how to remove the Roselle 16 unit").
 *
 * Deleting is irreversible, so it's a deliberate two-step: click "Delete",
 * then confirm in an inline panel that names the record and says what happens.
 * No browser confirm() — those are easy to click through by reflex.
 */
export default function DeleteButton({
  endpoint,
  label,
  what,
  consequence,
  redirectTo,
}: {
  /** e.g. `/api/properties/${slug}` */
  endpoint: string;
  /** The record's display name, shown in the confirmation. */
  label: string;
  /** "listing" | "broker" | "post" */
  what: string;
  /** One sentence on what disappears from the public site. */
  consequence: string;
  /** Admin list page to return to after the delete succeeds. */
  redirectTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || `Delete failed (${res.status})`);
      }
      // Full navigation so the list page re-reads from the database.
      window.location.assign(redirectTo);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="card p-5 border-red-200">
      <h4 className="font-semibold text-sm mb-1 text-red-700">Delete {what}</h4>
      {!open ? (
        <>
          <p className="text-xs text-slate-500 mb-3">
            Removes this {what} permanently. To hide it without deleting, change its status instead.
          </p>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs border border-red-200 text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg w-full flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete this {what}…
          </button>
        </>
      ) : (
        <>
          <p className="text-xs text-slate-700 mb-2">
            Delete <strong>{label}</strong>? {consequence} This cannot be undone.
          </p>
          {error ? <p className="text-xs text-red-600 mb-2">{error}</p> : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="text-xs border border-slate-200 px-3 py-2 rounded-lg flex-1 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={doDelete}
              disabled={busy}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex-1 font-medium disabled:opacity-50"
            >
              {busy ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
