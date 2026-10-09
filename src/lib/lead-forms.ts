/**
 * Shared vocabulary for the public lead forms and the admin inbox.
 *
 * Both sides import from here so a form field added on the website shows up
 * with a readable label in the admin without anyone touching a second file.
 */

/** Workflow states a lead moves through. Lives here (not data.ts) so client components can import it. */
export const INQUIRY_STATUSES = ["new", "contacted", "qualified", "in progress", "closed", "lost"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

/** Fields that are stored in their own columns rather than in `details`. */
export const CORE_LEAD_KEYS = new Set([
  "first_name", "last_name", "full_name", "name", "email", "phone",
  "notes", "message", "additional_info", "situation_notes", "motivation",
  "property_slug", "broker_slug", "sms_consent",
  // bot-protection + plumbing — never shown to anyone
  "website_url", "__form_loaded_at", "__form_elapsed_ms", "_submitting", "form_type", "source",
  "submitted_at", "page_url", "referrer",
  "utm_source", "utm_medium", "utm_campaign", "utm_content",
  "resume", "resume_path",
]);

/** The free-text note on each form, in priority order. */
export const NOTE_KEYS = ["additional_info", "situation_notes", "motivation", "notes", "message"] as const;

export type FormTypeMeta = {
  label: string;
  /** Detail keys the server insists on (the browser also enforces `required`). */
  requiredDetails?: string[];
};

export const FORM_TYPES: Record<string, FormTypeMeta> = {
  contact: { label: "Contact" },
  buying: { label: "Buyer" },
  selling: { label: "Full valuation", requiredDetails: ["property_address"] },
  quick_valuation: { label: "Quick valuation", requiredDetails: ["property_address"] },
  exchange_1031: { label: "1031 exchange" },
  careers: { label: "Careers" },
  property: { label: "Listing inquiry" },
};

export function formTypeLabel(type?: string | null): string {
  if (!type) return "Website";
  return FORM_TYPES[type]?.label ?? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Friendly labels for detail keys. Anything missing falls back to humanize(). */
const FIELD_LABELS: Record<string, string> = {
  inquiry_type: "What it's about",
  property_address: "Property address",
  unit_count: "Units",
  unit_mix: "Unit mix",
  annual_expenses: "Annual expenses",
  gross_income: "Gross income",
  window_age: "Windows age",
  roof_age: "Roof age",
  mechanical_age: "Mechanicals age",
  condition: "Condition",
  preferred_units: "Preferred unit count",
  purchase_areas: "Areas of interest",
  relinquished_property: "Property being sold",
  sale_timeline: "Sale timeline",
  replacement_goals: "Replacement goals",
  page_url: "Submitted from",
};

export function humanizeKey(key: string): string {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDetailValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (Array.isArray(v)) return v.map(String).filter(Boolean).join(", ");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return String(v);
}

/**
 * Builds the plain-text summary that goes into `message` (and to GoHighLevel):
 * the visitor's own note first, then one "Label: value" line per detail.
 */
export function composeLeadMessage(note: string, details: Record<string, unknown>): string {
  const lines = Object.entries(details)
    .map(([k, v]) => [humanizeKey(k), formatDetailValue(v)] as const)
    .filter(([, v]) => v.trim().length > 0)
    .map(([k, v]) => `${k}: ${v}`);
  return [note.trim(), lines.join("\n")].filter(Boolean).join("\n\n");
}
