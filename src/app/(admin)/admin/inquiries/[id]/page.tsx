import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Mail, Phone } from "lucide-react";
import { getInquiry, getBrokers } from "@/lib/data";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { formTypeLabel } from "@/lib/lead-forms";
import { formatWhen, leadDetails, leadNote } from "@/lib/inquiry-ui";
import InquiryWorkflow from "./InquiryWorkflow";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function telHref(phone?: string) {
  const digits = (phone || "").replace(/\D+/g, "");
  return digits ? `tel:${digits}` : undefined;
}

export default async function InquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const [lead, brokers] = await Promise.all([getInquiry(id), getBrokers().catch(() => [])]);
  if (!lead) notFound();

  // Résumés live in a private bucket; hand the admin a 1-hour signed link.
  let resumeUrl: string | null = null;
  if (lead.resume_path && isSupabaseConfigured) {
    const { data } = await supabaseAdmin().storage.from("resumes").createSignedUrl(lead.resume_path, 60 * 60);
    resumeUrl = data?.signedUrl ?? null;
  }

  const note = leadNote(lead);
  const details = leadDetails(lead);
  const type = formTypeLabel(lead.form_type || lead.source);
  const tel = telHref(lead.phone);
  const brokerName = (slug?: string) => brokers.find((b) => b.slug === slug)?.name || slug || "";

  const tracking: Array<[string, string]> = [];
  if (lead.page_url) tracking.push(["Submitted from", lead.page_url]);
  if (lead.referrer) tracking.push(["Referrer", lead.referrer]);
  if (lead.utm_source) tracking.push(["UTM source", lead.utm_source]);
  if (lead.utm_medium) tracking.push(["UTM medium", lead.utm_medium]);
  if (lead.utm_campaign) tracking.push(["UTM campaign", lead.utm_campaign]);
  if (lead.utm_content) tracking.push(["UTM content", lead.utm_content]);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <Link href="/admin/inquiries" className="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2">
          <ArrowLeft className="w-4 h-4" /> All inquiries
        </Link>
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-xl font-semibold">{lead.name}</h1>
            <p className="text-sm text-slate-500">
              {type} · {formatWhen(lead.created_at)}
              {lead.property_slug ? (
                <>
                  {" · about "}
                  <Link href={`/admin/listings/${lead.property_slug}`} className="underline decoration-slate-300">
                    {lead.property_slug}
                  </Link>
                </>
              ) : null}
              {lead.broker_slug ? ` · asked for ${brokerName(lead.broker_slug)}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {lead.email ? (
              <a href={`mailto:${lead.email}`} className="btn-ghost text-sm px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> {lead.email}
              </a>
            ) : null}
            {tel ? (
              <a href={tel} className="btn-ghost text-sm px-3 py-2 rounded-lg border border-slate-200 flex items-center gap-1.5">
                <Phone className="w-4 h-4" /> {lead.phone}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className="p-8 grid grid-cols-3 gap-5 items-start">
        <div className="col-span-2 space-y-5">
          {note ? (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-2">What they wrote</h3>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{note}</p>
            </div>
          ) : null}

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3">Details</h3>
            {details.length === 0 ? (
              <p className="text-sm text-slate-500">No extra fields on this form.</p>
            ) : (
              <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                {details.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="whitespace-pre-wrap">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {lead.sms_consent ? (
              <p className="text-xs text-slate-500 mt-4">✓ Agreed to receive SMS at the number provided.</p>
            ) : null}
          </div>

          {lead.resume_path ? (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-2">Résumé</h3>
              {resumeUrl ? (
                <a href={resumeUrl} target="_blank" rel="noopener" className="text-sm underline flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Open résumé (link valid for 1 hour)
                </a>
              ) : (
                <p className="text-sm text-slate-500">Stored at {lead.resume_path} — could not create a link right now.</p>
              )}
            </div>
          ) : null}

          {tracking.length > 0 ? (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-3">Where it came from</h3>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm">
                {tracking.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="break-all">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : null}
        </div>

        <InquiryWorkflow
          id={lead.id as string}
          initialStatus={lead.status || "new"}
          initialAssignedTo={lead.assigned_to || ""}
          initialNotes={lead.notes || ""}
          brokers={brokers.map((b) => ({ slug: b.slug, name: b.name }))}
          updatedLabel={lead.updated_at ? formatWhen(lead.updated_at) : null}
        />
      </div>
    </>
  );
}
