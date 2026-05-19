"use client";

import { ChangeEvent, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCircle, Phone, BookOpen, Award, GraduationCap, TrendingUp } from "lucide-react";
import type { Broker } from "@/lib/types";
import { Field, FieldInput, FieldSelect, FieldTextarea, FieldLabel } from "@/components/ui/FieldInput";
import { initials, resolveImageUrl } from "@/lib/utils";

const TITLE_OPTIONS = [
  "Founder · Multifamily Broker",
  "Partner / Broker",
  "Senior Broker",
  "Commercial Broker",
  "Commercial Broker · Deal Operations Manager",
  "Associate Broker",
  "Data Analyst",
];

export default function BrokerEditor({ initial }: { initial: Broker }) {
  const [form, setForm] = useState<Broker>({
    ...initial,
    specialties: initial.specialties ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newSpec, setNewSpec] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  function patch(p: Partial<Broker>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/brokers/${form.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => patch({ photo_url: String(reader.result) });
    reader.readAsDataURL(file);
  }

  function addSpec() {
    const t = newSpec.trim();
    if (!t) return;
    patch({ specialties: [...(form.specialties ?? []), t] });
    setNewSpec("");
  }
  function removeSpec(i: number) {
    patch({ specialties: (form.specialties ?? []).filter((_, idx) => idx !== i) });
  }

  // Split name into first/last for the form
  const [first = "", ...lastParts] = form.name.split(" ");
  const last = lastParts.join(" ");

  const photo = resolveImageUrl(form.photo_url);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/brokers" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Edit broker profile</h1>
            <p className="text-xs text-slate-500">
              Updates publish to ajcommercialgroup.com/brokers within 30 seconds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt ? <span className="text-xs text-emerald-600">Saved at {savedAt}</span> : null}
          {error ? <span className="text-xs text-red-600">{error}</span> : null}
          <button type="button" className="btn-ghost text-sm px-3 py-2 rounded-lg">Preview</button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-6">
            <div className="section-header"><UserCircle className="w-4 h-4" /> Headshot & identity</div>
            <div className="flex gap-5 mb-5">
              <div>
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt={form.name} className="w-28 h-28 rounded-full object-cover bg-slate-100" />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-serif text-3xl font-bold">
                    {initials(form.name)}
                  </div>
                )}
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs btn-ghost border border-slate-200 px-2 py-1 rounded mt-2 w-full"
                >
                  Change photo
                </button>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="First name">
                    <FieldInput value={first} onChange={(e) => patch({ name: `${e.target.value} ${last}`.trim() })} />
                  </Field>
                  <Field label="Last name">
                    <FieldInput value={last} onChange={(e) => patch({ name: `${first} ${e.target.value}`.trim() })} />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Field label="Title">
                    <FieldSelect value={form.title} onChange={(e) => patch({ title: e.target.value })}>
                      {TITLE_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                      {TITLE_OPTIONS.includes(form.title) ? null : <option>{form.title}</option>}
                    </FieldSelect>
                  </Field>
                  <Field label="License #">
                    <FieldInput value={form.license_number ?? ""} onChange={(e) => patch({ license_number: e.target.value })} />
                  </Field>
                </div>
                <FieldLabel>Tagline <span className="text-slate-400 normal-case">(one line, appears under name)</span></FieldLabel>
                <FieldInput value={form.tagline ?? ""} onChange={(e) => patch({ tagline: e.target.value })} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><Phone className="w-4 h-4" /> Contact info</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Email"><FieldInput value={form.email} onChange={(e) => patch({ email: e.target.value })} /></Field>
              <Field label="Direct phone"><FieldInput value={form.phone} onChange={(e) => patch({ phone: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="LinkedIn URL"><FieldInput value={form.linkedin_url ?? ""} onChange={(e) => patch({ linkedin_url: e.target.value })} placeholder="linkedin.com/in/…" /></Field>
              <Field label="Crexi profile"><FieldInput value={form.crexi_url ?? ""} onChange={(e) => patch({ crexi_url: e.target.value })} placeholder="crexi.com/profile/…" /></Field>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><BookOpen className="w-4 h-4" /> Bio</div>
            <p className="text-xs text-slate-500 -mt-3 mb-4">Full bio shown on the broker&apos;s profile page. Aim for 150–300 words.</p>
            <FieldTextarea
              rows={9}
              value={form.bio}
              onChange={(e) => patch({ bio: e.target.value })}
              className="leading-relaxed"
            />
          </div>

          <div className="card p-6">
            <div className="section-header"><Award className="w-4 h-4" /> Specialties</div>
            <p className="text-xs text-slate-500 -mt-3 mb-4">Tap to remove. Type below to add.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(form.specialties ?? []).map((s, i) => (
                <button key={`${s}-${i}`} type="button" onClick={() => removeSpec(i)} className="pill pill-blue cursor-pointer">
                  {s} ×
                </button>
              ))}
              {(form.specialties ?? []).length === 0 ? (
                <span className="text-xs text-slate-400">No specialties yet.</span>
              ) : null}
            </div>
            <FieldInput
              placeholder="Type specialty and press Enter (e.g. Multifamily, Logan Square)…"
              value={newSpec}
              onChange={(e) => setNewSpec(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSpec();
                }
              }}
            />
          </div>

          <div className="card p-6">
            <div className="section-header"><GraduationCap className="w-4 h-4" /> Background</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Years in commercial RE"><FieldInput value={String(form.years_in_cre ?? "")} onChange={(e) => patch({ years_in_cre: e.target.value })} /></Field>
              <Field label="Joined AJ Commercial"><FieldInput type="date" value={form.joined_date ?? ""} onChange={(e) => patch({ joined_date: e.target.value })} /></Field>
            </div>
            <div className="mb-4">
              <Field label="Education"><FieldInput value={form.education ?? ""} onChange={(e) => patch({ education: e.target.value })} /></Field>
            </div>
            <div className="mb-4">
              <Field label="Certifications / designations"><FieldInput value={form.certifications ?? ""} onChange={(e) => patch({ certifications: e.target.value })} /></Field>
            </div>
            <div>
              <Field label="Languages"><FieldInput value={form.languages ?? "English"} onChange={(e) => patch({ languages: e.target.value })} /></Field>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><TrendingUp className="w-4 h-4" /> Recent transactions</div>
            <p className="text-xs text-slate-500 -mt-3 mb-4">Auto-pulled from this broker&apos;s track record in the dataset.</p>
            {form.track_record?.length ? (
              <div className="space-y-2">
                {form.track_record.map((t) => (
                  <label
                    key={t.property_slug}
                    className="flex items-center gap-3 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                  >
                    <input type="checkbox" defaultChecked />
                    <div className="flex-1 text-sm">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.subtitle}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No recent transactions in the dataset.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Display</h4>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={form.show_on_team_page ?? true} onChange={(e) => patch({ show_on_team_page: e.target.checked })} />
              Show on team page
            </label>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={form.feature_on_homepage ?? form.is_partner} onChange={(e) => patch({ feature_on_homepage: e.target.checked })} />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hide_phone ?? false} onChange={(e) => patch({ hide_phone: e.target.checked })} />
              Hide phone numbers
            </label>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Team page order</h4>
            <p className="text-xs text-slate-500 mb-3">Lower numbers display first on /brokers</p>
            <FieldInput
              type="number"
              value={String(form.display_order ?? 0)}
              onChange={(e) => patch({ display_order: Number(e.target.value) })}
            />
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Profile URL</h4>
            <div className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5 truncate">/brokers/{form.slug}</div>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Quick stats <span className="text-xs text-slate-400 font-normal">(shown on profile)</span></h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Total $ closed"><FieldInput value={form.total_closed ?? ""} onChange={(e) => patch({ total_closed: e.target.value })} placeholder="$80M+" /></Field>
              <Field label="Units sold"><FieldInput value={form.units_sold ?? ""} onChange={(e) => patch({ units_sold: e.target.value })} placeholder="450+" /></Field>
              <Field label="Deals closed"><FieldInput value={String(form.deals_closed ?? form.track_record?.length ?? "")} onChange={(e) => patch({ deals_closed: e.target.value })} /></Field>
              <Field label="Avg. days on market"><FieldInput value={String(form.avg_days_on_market ?? "")} onChange={(e) => patch({ avg_days_on_market: e.target.value })} /></Field>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
