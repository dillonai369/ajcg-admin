"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { INQUIRY_STATUSES } from "@/lib/lead-forms";
import { statusLabel } from "@/lib/inquiry-ui";

/**
 * The part of a lead the team changes: status, who owns it, internal notes.
 * The lead's own content stays read-only — it's what the visitor sent.
 */
export default function InquiryWorkflow({
  id,
  initialStatus,
  initialAssignedTo,
  initialNotes,
  brokers,
  updatedLabel,
}: {
  id: string;
  initialStatus: string;
  initialAssignedTo: string;
  initialNotes: string;
  brokers: Array<{ slug: string; name: string }>;
  /** Pre-formatted on the server — formatting dates in the browser causes hydration mismatches. */
  updatedLabel: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [assignedTo, setAssignedTo] = useState(initialAssignedTo);
  const [notes, setNotes] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty = status !== initialStatus || assignedTo !== initialAssignedTo || notes !== initialNotes;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assigned_to: assignedTo, notes }),
      });
      if (!res.ok) throw new Error(((await res.json().catch(() => ({}))) as { error?: string }).error || "Save failed");
      setSavedAt(new Date().toLocaleTimeString());
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm("Delete this lead? This can't be undone.")) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/inquiries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/inquiries");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  return (
    <div className="card p-5 sticky top-6 space-y-4">
      <h3 className="font-semibold text-sm">Follow-up</h3>

      <div>
        <label className="field-label">Status</label>
        <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
          {INQUIRY_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Assigned to</label>
        <select className="field-input" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
          <option value="">Unassigned</option>
          {brokers.map((b) => (
            <option key={b.slug} value={b.slug}>{b.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Internal notes</label>
        <textarea
          className="field-input"
          rows={7}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Call notes, next steps, anything the team should know. Not visible to the lead."
        />
      </div>

      {error ? <div className="text-sm text-red-600">{error}</div> : null}

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="btn-primary text-sm px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={remove}
          disabled={saving}
          className="text-sm text-slate-400 hover:text-red-600 flex items-center gap-1"
          title="Delete lead"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      <div className="text-xs text-slate-400">
        {savedAt ? `Saved ${savedAt}` : updatedLabel ? `Last updated ${updatedLabel}` : "Not updated yet"}
      </div>
    </div>
  );
}
