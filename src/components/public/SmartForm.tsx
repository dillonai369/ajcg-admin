"use client";

import { FormEvent, ReactNode, useState } from "react";

/**
 * Client-side wrapper around <form> that ports the logic in
 * /public/assets/form-handler.js into a React component.
 *
 * On submit it:
 *   1. POSTs the full form payload to /api/lead (the GHL relay endpoint —
 *      preserved from the static site for CRM continuity).
 *   2. POSTs a slimmed-down inquiry payload to /api/inquiries so the new
 *      Supabase-backed admin dashboard sees the lead too.
 *
 * We don't bring in assets/form-handler.js because that script binds on
 * DOMContentLoaded and would miss client-side route transitions.
 */
export default function SmartForm({
  formType,
  className,
  children,
  intro,
}: {
  formType: string;
  className?: string;
  children: ReactNode;
  intro?: ReactNode;
}) {
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function captureUtm(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const sp = new URLSearchParams(window.location.search);
    return {
      utm_source: sp.get("utm_source") || "",
      utm_medium: sp.get("utm_medium") || "",
      utm_campaign: sp.get("utm_campaign") || "",
      utm_content: sp.get("utm_content") || "",
    };
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    setStatus(null);

    // Serialize form including multi-value checkboxes
    const fd = new FormData(form);
    const data: Record<string, string | string[]> = {};
    fd.forEach((value, key) => {
      const v = typeof value === "string" ? value : "";
      const existing = data[key];
      if (existing === undefined) data[key] = v;
      else if (Array.isArray(existing)) existing.push(v);
      else data[key] = [existing, v];
    });

    const rawName = String(data.full_name || data.name || "").trim();
    let first_name = "";
    let last_name = "";
    if (rawName) {
      const parts = rawName.split(/\s+/);
      first_name = parts.slice(0, -1).join(" ") || parts[0];
      last_name = parts.length > 1 ? parts[parts.length - 1] : "";
    } else {
      first_name = String(data.first_name || "");
      last_name = String(data.last_name || "");
    }

    const payload: Record<string, unknown> = {
      ...data,
      first_name,
      last_name,
      name: rawName || `${first_name} ${last_name}`.trim(),
      full_name: rawName || `${first_name} ${last_name}`.trim(),
      form_type: formType,
      source: "ajcommercialgroup.com",
      submitted_at: new Date().toISOString(),
      page_url: typeof window !== "undefined" ? window.location.href : "",
      referrer: typeof document !== "undefined" ? document.referrer : "",
      ...captureUtm(),
    };

    const inquiryPayload = {
      name: payload.name || `${first_name} ${last_name}`.trim(),
      email: data.email || "",
      phone: data.phone || "",
      message: data.notes || data.message || "",
      source: formType,
      property_slug: typeof data.property_slug === "string" ? data.property_slug : undefined,
      broker_slug: typeof data.broker_slug === "string" ? data.broker_slug : undefined,
    };

    try {
      // Fire both endpoints in parallel — neither blocks the success message.
      await Promise.allSettled([
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inquiryPayload),
        }),
      ]);
      setStatus({
        message: "Thanks — we got it. A real broker will reach out within one business day.",
        isError: false,
      });
      form.reset();
    } catch {
      // Even on failure we show success so the visitor isn't blocked.
      setStatus({
        message: "Thanks — we got it. A real broker will reach out within one business day.",
        isError: false,
      });
      form.reset();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={className} onSubmit={onSubmit} noValidate>
      {intro}
      {children}
      {status && (
        <div
          className="form-status"
          style={{
            marginTop: 18,
            padding: "14px 18px",
            borderRadius: 6,
            fontSize: 14,
            fontWeight: 500,
            lineHeight: 1.5,
            background: status.isError ? "#FEE2E2" : "#DCFCE7",
            color: status.isError ? "#991B1B" : "#14532D",
            border: `1px solid ${status.isError ? "#FCA5A5" : "#86EFAC"}`,
          }}
        >
          {status.message}
        </div>
      )}
      <input type="hidden" name="_submitting" value={submitting ? "1" : "0"} />
    </form>
  );
}
