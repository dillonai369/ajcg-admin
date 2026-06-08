"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Image as ImageIcon, Info, Ruler, DollarSign, Sparkles, AlignLeft, Plus, X } from "lucide-react";
import type { Property, Broker } from "@/lib/types";
import PhotoUpload from "@/components/PhotoUpload";
import { Field, FieldInput, FieldSelect, FieldTextarea, FieldLabel } from "@/components/ui/FieldInput";
import { AIInlineAssist } from "@/components/AIAssistPanel";

const STATUS_OPTIONS = ["Coming Soon", "For Sale", "Under Contract", "Sold", "Draft"];
const TYPE_OPTIONS = ["Multifamily", "Mixed-Use", "Retail", "Office", "Industrial"];

export default function ListingEditor({ initial }: { initial: Property }) {
  const [form, setForm] = useState<Property>({
    ...initial,
    highlights: initial.highlights ?? [],
    images: initial.images ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newHighlight, setNewHighlight] = useState("");
  const [allBrokers, setAllBrokers] = useState<Broker[]>([]);

  // Load brokers once for the "Listed by" picker
  useEffect(() => {
    fetch("/api/brokers")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Broker[]) => setAllBrokers(data))
      .catch(() => {});
  }, []);

  function patch(p: Partial<Property>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function saveWithStatus(statusOverride?: string) {
    setSaving(true);
    setError(null);
    try {
      const payload = statusOverride ? { ...form, status: statusOverride } : form;
      const res = await fetch(`/api/properties/${form.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      if (statusOverride) patch({ status: statusOverride });
      setSavedAt(new Date().toLocaleTimeString());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const save = () => saveWithStatus();
  const saveDraft = () => saveWithStatus("draft");

  function addBrokerSlug(slug: string) {
    if (!slug) return;
    const existing = (form as Property & { broker_slugs?: string[] }).broker_slugs ?? [];
    if (existing.includes(slug)) return;
    patch({ ...(form as Property), broker_slugs: [...existing, slug] } as Partial<Property>);
  }
  function removeBrokerSlug(slug: string) {
    const existing = (form as Property & { broker_slugs?: string[] }).broker_slugs ?? [];
    patch({ ...(form as Property), broker_slugs: existing.filter((s) => s !== slug) } as Partial<Property>);
  }
  const assignedSlugs: string[] = (form as Property & { broker_slugs?: string[] }).broker_slugs ?? [];

  function addHighlight() {
    const trimmed = newHighlight.trim();
    if (!trimmed) return;
    patch({ highlights: [...(form.highlights ?? []), trimmed] });
    setNewHighlight("");
  }

  function removeHighlight(idx: number) {
    patch({ highlights: (form.highlights ?? []).filter((_, i) => i !== idx) });
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">{form.name}</h1>
            <p className="text-xs text-slate-500">Edits publish to ajcommercialgroup.com/listings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt ? <span className="text-xs text-emerald-600">Saved at {savedAt}</span> : null}
          {error ? <span className="text-xs text-red-600">{error}</span> : null}
          <button
            type="button"
            onClick={saveDraft}
            disabled={saving}
            className="btn-ghost text-sm px-3 py-2 rounded-lg disabled:opacity-50"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => {
              import("@/lib/utils").then(({ publicSiteUrl }) => {
                window.open(publicSiteUrl(`/property/${form.slug}`), "_blank", "noopener,noreferrer");
              });
            }}
            className="text-sm px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Publish to site"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">

          <div className="card p-6">
            <div className="section-header"><ImageIcon className="w-4 h-4" /> Property photos</div>
            <PhotoUpload images={form.images} onChange={(images) => patch({ images, hero_image: images[0] ?? form.hero_image })} />
          </div>

          <div className="card p-6">
            <div className="section-header"><Info className="w-4 h-4" /> Property details</div>

            <div className="mb-4">
              <Field label="Property name">
                <FieldInput value={form.name} onChange={(e) => patch({ name: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Status">
                <FieldSelect value={form.status} onChange={(e) => patch({ status: e.target.value })}>
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </FieldSelect>
              </Field>
              <Field label="Property type">
                <FieldSelect value={form.type || "Multifamily"} onChange={(e) => patch({ type: e.target.value })}>
                  {TYPE_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </FieldSelect>
              </Field>
            </div>

            <div className="mb-4">
              <Field label="Street address">
                <FieldInput value={form.address ?? ""} onChange={(e) => patch({ address: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="City"><FieldInput value={form.city ?? ""} onChange={(e) => patch({ city: e.target.value })} /></Field>
              <Field label="State"><FieldInput value={form.state ?? "IL"} onChange={(e) => patch({ state: e.target.value })} /></Field>
              <Field label="ZIP"><FieldInput value={form.zip ?? ""} onChange={(e) => patch({ zip: e.target.value })} /></Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Neighborhood"><FieldInput value={form.neighborhood ?? ""} onChange={(e) => patch({ neighborhood: e.target.value })} /></Field>
              <Field label="Sub-market"><FieldInput value={form.submarket ?? ""} onChange={(e) => patch({ submarket: e.target.value })} /></Field>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><Ruler className="w-4 h-4" /> Building specs</div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Total units"><FieldInput value={form.units ?? ""} onChange={(e) => patch({ units: e.target.value })} /></Field>
              <Field label="Total sqft"><FieldInput value={form.total_sqft ?? ""} onChange={(e) => patch({ total_sqft: e.target.value })} /></Field>
              <Field label="Lot size (sqft)"><FieldInput value={form.lot_size ?? ""} onChange={(e) => patch({ lot_size: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <Field label="Year built"><FieldInput value={form.year_built ?? ""} onChange={(e) => patch({ year_built: e.target.value })} /></Field>
              <Field label="Stories"><FieldInput value={form.stories ?? ""} onChange={(e) => patch({ stories: e.target.value })} /></Field>
              <Field label="Building class">
                <FieldSelect value={form.building_class ?? "Class B"} onChange={(e) => patch({ building_class: e.target.value })}>
                  <option>Class A</option><option>Class B</option><option>Class C</option>
                </FieldSelect>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Parking spaces"><FieldInput value={form.parking ?? ""} onChange={(e) => patch({ parking: e.target.value })} /></Field>
              <Field label="Heating">
                <FieldSelect value={form.heating ?? "Forced air"} onChange={(e) => patch({ heating: e.target.value })}>
                  <option>Boiler / steam</option><option>Forced air</option><option>Hydronic</option><option>Other</option>
                </FieldSelect>
              </Field>
              <Field label="Year renovated"><FieldInput value={form.year_renovated ?? ""} onChange={(e) => patch({ year_renovated: e.target.value })} placeholder="—" /></Field>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><DollarSign className="w-4 h-4" /> Financials</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Field label="Sale price"><FieldInput value={form.sale_price ?? ""} onChange={(e) => patch({ sale_price: e.target.value })} /></Field>
              <Field label="Sale date"><FieldInput type="date" value={form.sale_date ?? ""} onChange={(e) => patch({ sale_date: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Cap rate"><FieldInput value={form.cap_rate ?? ""} onChange={(e) => patch({ cap_rate: e.target.value })} /></Field>
              <Field label="NOI"><FieldInput value={form.noi ?? ""} onChange={(e) => patch({ noi: e.target.value })} /></Field>
              <Field label="Gross income"><FieldInput value={form.gross_income ?? ""} onChange={(e) => patch({ gross_income: e.target.value })} /></Field>
            </div>
          </div>

          <div className="card p-6">
            <div className="section-header"><Sparkles className="w-4 h-4" /> Highlights / features</div>
            <p className="text-xs text-slate-500 -mt-3 mb-4">Tap a pill to remove. Type below to add.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {(form.highlights ?? []).map((h, i) => (
                <button
                  key={`${h}-${i}`}
                  type="button"
                  onClick={() => removeHighlight(i)}
                  className="pill pill-blue cursor-pointer"
                >
                  {h} ×
                </button>
              ))}
              {(form.highlights ?? []).length === 0 ? (
                <span className="text-xs text-slate-400">No highlights yet.</span>
              ) : null}
            </div>
            <FieldInput
              placeholder="Type custom highlight and press Enter…"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addHighlight();
                }
              }}
            />
          </div>

          <div className="card p-6">
            <div className="section-header"><AlignLeft className="w-4 h-4" /> Description</div>
            <FieldTextarea
              rows={6}
              value={form.description ?? ""}
              onChange={(e) => patch({ description: e.target.value })}
              className="mb-4"
            />
            <AIInlineAssist
              getInput={() => form.description ?? ""}
              onResult={(out) => patch({ description: out })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Listed by</h4>
            <p className="text-xs text-slate-500 mb-3">Assign one or more brokers</p>
            {assignedSlugs.length > 0 ? (
              <div className="space-y-2 mb-3">
                {assignedSlugs.map((slug) => {
                  const b = allBrokers.find((x) => x.slug === slug);
                  return (
                    <div key={slug} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-semibold">
                        {(b?.name ?? slug).split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 text-sm">{b?.name ?? slug}</div>
                      <button
                        type="button"
                        onClick={() => removeBrokerSlug(slug)}
                        className="btn-ghost p-1 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : null}
            <FieldSelect
              value=""
              onChange={(e) => {
                addBrokerSlug(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">+ Add broker…</option>
              {allBrokers
                .filter((b) => !assignedSlugs.includes(b.slug))
                .map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
            </FieldSelect>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Display</h4>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={form.feature_on_homepage ?? false} onChange={(e) => patch({ feature_on_homepage: e.target.checked })} />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2 text-sm mb-2">
              <input type="checkbox" checked={form.show_in_sold_carousel ?? true} onChange={(e) => patch({ show_in_sold_carousel: e.target.checked })} />
              Show in sold listings carousel
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.hide_sale_price ?? false} onChange={(e) => patch({ hide_sale_price: e.target.checked })} />
              Hide sale price
            </label>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">SEO</h4>
            <FieldLabel>URL slug</FieldLabel>
            <div className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1.5 mb-3 truncate">/sold/{form.slug}</div>
            <FieldLabel>Meta title</FieldLabel>
            <FieldInput className="mb-3" value={form.meta_title ?? form.name} onChange={(e) => patch({ meta_title: e.target.value })} />
            <FieldLabel>Meta description</FieldLabel>
            <FieldTextarea rows={3} value={form.meta_description ?? form.description} onChange={(e) => patch({ meta_description: e.target.value })} />
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Documents</h4>
            <p className="text-xs text-slate-500 mb-3">OM, rent roll, T-12 — coming soon</p>
            <button
              type="button"
              disabled
              className="text-xs border border-slate-200 px-3 py-2 rounded-lg w-full flex items-center justify-center gap-1 opacity-40 cursor-not-allowed text-slate-500"
              title="Document upload coming in a follow-up release"
            >
              Upload document (coming soon)
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
