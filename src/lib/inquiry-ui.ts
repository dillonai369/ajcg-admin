/**
 * Presentation helpers for leads in the admin (list, detail, dashboard).
 * Pure functions — safe to import from server and client components.
 */
import type { Inquiry } from "./data";
import { formatDetailValue, humanizeKey } from "./lead-forms";

export function statusLabel(status?: string | null): string {
  switch ((status || "new").toLowerCase()) {
    case "contacted": return "Contacted";
    case "qualified": return "Qualified";
    case "in progress": return "In progress";
    case "closed": return "Closed";
    case "lost": return "Lost";
    default: return "New";
  }
}

export function statusPill(status?: string | null): string {
  switch ((status || "new").toLowerCase()) {
    case "contacted": return "pill-blue";
    case "qualified": return "pill-purple";
    case "in progress": return "pill-green";
    case "closed": return "pill-gray";
    case "lost": return "pill-red";
    default: return "pill-amber";
  }
}

/** "Oct 2, 3:14 PM" in Chicago time; falls back gracefully on bad input. */
export function formatWhen(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The visitor's own note, if they wrote one — the first paragraph of `message`. */
export function leadNote(q: Inquiry): string {
  const m = (q.message || "").trim();
  if (!m) return "";
  const first = m.split("\n\n")[0].trim();
  // Legacy rows have no separate note; the whole message is "Label: value"
  // lines. Treat a first paragraph that looks like one of those as no note.
  if (/^[A-Z][\w\s'()/-]{0,40}: /.test(first) && !first.includes("\n")) return "";
  return first;
}

/**
 * Structured details for display. New rows have `details`; old rows only have
 * the "Label: value" text block in `message`, which this parses back out so
 * historical leads read the same way as new ones.
 */
export function leadDetails(q: Inquiry): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  if (q.details && typeof q.details === "object" && Object.keys(q.details).length > 0) {
    for (const [k, v] of Object.entries(q.details)) {
      const val = formatDetailValue(v);
      if (val.trim()) out.push([humanizeKey(k), val]);
    }
    return out;
  }
  const m = (q.message || "").trim();
  if (!m) return out;
  const paragraphs = m.split("\n\n");
  const block = paragraphs.length > 1 ? paragraphs.slice(1).join("\n") : leadNote(q) ? "" : m;
  for (const line of block.split("\n")) {
    const idx = line.indexOf(": ");
    if (idx > 0 && idx < 48) {
      const label = line.slice(0, idx).trim();
      const val = line.slice(idx + 2).trim();
      // Drop the junk line older rows carry from a hidden form input.
      if (label.toLowerCase() === "submitting") continue;
      if (val) out.push([label, val]);
    }
  }
  return out;
}

/** One line for the list view: note if present, else the first couple of details. */
export function leadSummary(q: Inquiry): string {
  const note = leadNote(q);
  if (note) return note;
  return leadDetails(q)
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}
