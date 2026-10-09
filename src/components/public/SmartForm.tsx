"use client";

import { FormEvent, ReactNode, useState, useRef } from "react";
import { CORE_LEAD_KEYS, NOTE_KEYS, composeLeadMessage } from "@/lib/lead-forms";

/**
 * Client-side wrapper around <form> for every lead form on the public site.
 *
 * On submit it:
 *   1. Uploads a résumé first, if the form has one (careers), to /api/resume.
 *   2. POSTs the full payload to /api/lead (the GoHighLevel relay).
 *   3. POSTs a structured inquiry to /api/inquiries so the admin inbox gets
 *      every field as data — not a text blob — plus where the lead came from.
 *
 * Browser validation is ON (no `noValidate`): a field marked `required` in
 * the page is actually required. The server double-checks the essentials.
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
  // Timestamp when the form mounted — the APIs treat submissions that arrive
  // <2s after load as bots. Set once on first render. We send the ELAPSED time
  // (not the timestamp) so a device with a wrong clock can't get a real person
  // flagged as a bot.
  const loadedAtRef = useRef<number>(Date.now());
  // Guards against double-clicks while an upload is in flight — React state
  // alone isn't synchronous enough to stop two submits a few ms apart.
  const inFlightRef = useRef(false);

  const MAX_RESUME_BYTES = 4 * 1024 * 1024; // Vercel rejects bodies over ~4.5 MB before we ever see them

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

  const FALLBACK_ERROR =
    "Something went wrong sending your message. Please call or text us at (630) 895-7989 or email contact@ajcommercialgroup.com and we'll take care of you right away.";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const form = e.currentTarget;
    setSubmitting(true);
    setStatus(null);
    const elapsedMs = Date.now() - loadedAtRef.current;

    // Serialize the form, keeping multi-value checkboxes as arrays and
    // setting file inputs aside (they go to storage, not JSON).
    const fd = new FormData(form);
    const data: Record<string, string | string[]> = {};
    const resumeEntry = fd.get("resume");
    const resumeFile = resumeEntry instanceof File && resumeEntry.size > 0 ? resumeEntry : null;
    fd.forEach((value, key) => {
      if (value instanceof File) return;
      const existing = data[key];
      if (existing === undefined) data[key] = value;
      else if (Array.isArray(existing)) existing.push(value);
      else data[key] = [existing, value];
    });

    const rawName = String(data.full_name || data.name || "").trim();
    let first_name = "";
    let last_name = "";
    if (rawName) {
      const parts = rawName.split(/\s+/);
      first_name = parts.slice(0, -1).join(" ") || parts[0];
      last_name = parts.length > 1 ? parts[parts.length - 1] : "";
    } else {
      first_name = String(data.first_name || "").trim();
      last_name = String(data.last_name || "").trim();
    }
    const name = rawName || `${first_name} ${last_name}`.trim();

    // The visitor's own words, whichever textarea this form uses.
    const note = NOTE_KEYS.map((k) => String(data[k] ?? "").trim()).find(Boolean) ?? "";

    // Everything else the form collected, as structured data.
    const details: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(data)) {
      if (CORE_LEAD_KEYS.has(k)) continue;
      const empty = Array.isArray(v) ? v.every((x) => !x.trim()) : !v.trim();
      if (!empty) details[k] = v;
    }

    const smsConsent = Boolean(data.sms_consent && String(data.sms_consent) !== "false");
    const utm = captureUtm();
    const pageUrl = typeof window !== "undefined" ? window.location.href : "";
    const referrer = typeof document !== "undefined" ? document.referrer : "";

    // Résumé goes to private storage first so the lead can reference it.
    // Problems the applicant can fix (too big, wrong type) stop the submit
    // with a clear message; a server hiccup records the failure on the lead
    // and continues, so the application itself is never lost.
    let resume_path: string | undefined;
    if (resumeFile) {
      if (resumeFile.size > MAX_RESUME_BYTES) {
        setStatus({ message: "Your résumé is over 4 MB. Please attach a smaller PDF or Word file.", isError: true });
        setSubmitting(false);
        inFlightRef.current = false;
        return;
      }
      try {
        const up = new FormData();
        up.append("file", resumeFile);
        up.append("website_url", String(data.website_url || ""));
        up.append("__form_elapsed_ms", String(elapsedMs));
        const r = await fetch("/api/resume", { method: "POST", body: up });
        const j = (await r.json().catch(() => ({}))) as { path?: string; error?: string };
        if (r.ok && j.path) {
          resume_path = j.path;
        } else if (r.status >= 400 && r.status < 500) {
          setStatus({ message: j.error || "We couldn't read that résumé file. Please attach a PDF or Word document.", isError: true });
          setSubmitting(false);
          inFlightRef.current = false;
          return;
        } else {
          details.resume_upload = `Failed: ${j.error || r.status}`;
        }
      } catch {
        details.resume_upload = "Failed: network error";
      }
    }

    const message = composeLeadMessage(note, details);

    // GoHighLevel relay: flat payload, every field at the top level, so the
    // workflow can map fields to custom fields directly.
    const leadPayload: Record<string, unknown> = {
      ...data,
      ...details,
      first_name,
      last_name,
      name,
      full_name: name,
      message,
      form_type: formType,
      source: "ajcommercialgroup.com",
      sms_consent: smsConsent,
      resume_path,
      __form_elapsed_ms: elapsedMs,
      submitted_at: new Date().toISOString(),
      page_url: pageUrl,
      referrer,
      ...utm,
    };

    // Admin inbox: structured.
    const inquiryPayload = {
      name,
      email: String(data.email || "").trim(),
      phone: String(data.phone || "").trim(),
      message,
      source: formType,
      form_type: formType,
      details,
      page_url: pageUrl,
      referrer,
      ...utm,
      sms_consent: smsConsent,
      property_slug: typeof data.property_slug === "string" ? data.property_slug : undefined,
      broker_slug: typeof data.broker_slug === "string" ? data.broker_slug : undefined,
      resume_path,
      // Bot-protection signals, stripped server-side before saving.
      website_url: data.website_url || "",
      __form_elapsed_ms: elapsedMs,
    };

    try {
      const [leadRes, inquiryRes] = await Promise.allSettled([
        fetch("/api/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadPayload),
        }),
        fetch("/api/inquiries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inquiryPayload),
        }),
      ]);

      // If the inbox rejected the submission for a reason the visitor can fix
      // (missing required field), say so — don't claim success.
      if (inquiryRes.status === "fulfilled" && (inquiryRes.value.status === 400 || inquiryRes.value.status === 422)) {
        const j = (await inquiryRes.value.json().catch(() => ({}))) as { error?: string };
        setStatus({ message: j.error || FALLBACK_ERROR, isError: true });
        return;
      }

      // Otherwise the lead is "captured" if EITHER destination accepted it —
      // a GHL outage shouldn't tell a prospect their message was lost when it
      // is sitting in the admin inbox (and vice versa).
      const ok = (r: PromiseSettledResult<Response>) => r.status === "fulfilled" && r.value.ok;
      if (ok(leadRes) || ok(inquiryRes)) {
        setStatus({
          message: "Thanks — we got it. A real broker will reach out within one business day.",
          isError: false,
        });
        form.reset();
      } else {
        console.error("Lead submission failed on both endpoints", { leadRes, inquiryRes });
        setStatus({ message: FALLBACK_ERROR, isError: true });
      }
    } catch (err) {
      console.error("Lead submission threw", err);
      setStatus({ message: FALLBACK_ERROR, isError: true });
    } finally {
      setSubmitting(false);
      inFlightRef.current = false;
    }
  }

  return (
    <form className={className} onSubmit={onSubmit}>
      {intro}
      {/* Honeypot — hidden from humans, bots auto-fill it. Any value is dropped
          server-side. Kept out of the tab order and screen readers. */}
      <input
        type="text"
        name="website_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      {children}
      {status && (
        <div
          className="form-status"
          role="status"
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
      {submitting ? (
        <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>Sending…</div>
      ) : null}
    </form>
  );
}
