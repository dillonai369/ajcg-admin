"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, X, ImagePlus } from "lucide-react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewListingForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    location: "",
    address: "",
    city: "",
    state: "IL",
    zip: "",
    neighborhood: "",
    units: "",
    type: "Multifamily",
    status: "sold",
    sale_price: "",
    sale_date: "",
    cap_rate: "",
    noi: "",
    total_sqft: "",
    year_built: "",
    description: "",
    body: "",
  });

  const [heroImage, setHeroImage] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  function patch<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "property-photos");
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(await r.text());
    const { url } = (await r.json()) as { url: string };
    return url;
  }

  async function handleHero(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setHeroImage(url);
      if (images.length === 0) setImages([url]);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleGallery(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadFile));
      setImages((prev) => [...prev, ...urls]);
      if (!heroImage && urls[0]) setHeroImage(urls[0]);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
    if (heroImage === url) setHeroImage(images.find((u) => u !== url) || "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Property name is required");
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(form.name);
      const body = {
        ...form,
        slug,
        hero_image: heroImage || images[0] || "",
        images,
        sale_date: form.sale_date || null,
      };
      const r = await fetch("/api/properties", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      router.push(`/admin/listings/${slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaving(false);
    }
  }

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/listings" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">New listing</h1>
            <p className="text-xs text-slate-500">Add a property — publishes to the live site within 60 seconds</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & continue"}
        </button>
      </header>

      <form onSubmit={handleSave} className="p-8 grid grid-cols-3 gap-6 max-w-6xl">
        <div className="col-span-2 space-y-4">
          {/* Photos */}
          <div className="card p-6">
            <div className="section-header">
              <ImagePlus className="w-4 h-4" /> Property photos
            </div>
            <label className="upload-zone rounded-lg p-8 text-center cursor-pointer block">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} disabled={uploading} />
              <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
              <div className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload one or more photos"}</div>
              <div className="text-xs text-slate-500 mt-1">First photo becomes the hero · stored in Supabase</div>
            </label>
            {images.length > 0 ? (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {images.map((url) => (
                  <div key={url} className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full aspect-[4/3] object-cover rounded-lg" />
                    {url === heroImage ? (
                      <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--gold)", color: "var(--navy)" }}>HERO</span>
                    ) : (
                      <button type="button" onClick={() => setHeroImage(url)} className="absolute top-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100">
                        Set hero
                      </button>
                    )}
                    <button type="button" onClick={() => removeImage(url)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded opacity-0 group-hover:opacity-100">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <label className="block mt-3 cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleHero} disabled={uploading} />
              <span className="text-xs text-slate-500 underline">Or upload one hero image only</span>
            </label>
          </div>

          {/* Details */}
          <div className="card p-6">
            <div className="section-header">Property details</div>
            <label className="field-label">Property name *</label>
            <input className="field-input mb-4" placeholder="e.g. The Magnolia — 24-Unit Uptown Walkup" value={form.name} onChange={(e) => patch("name", e.target.value)} />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="field-label">Status</label>
                <select className="field-input" value={form.status} onChange={(e) => patch("status", e.target.value)}>
                  <option value="coming soon">Coming Soon</option>
                  <option value="for sale">For Sale</option>
                  <option value="under contract">Under Contract</option>
                  <option value="sold">Sold</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              <div>
                <label className="field-label">Property type</label>
                <select className="field-input" value={form.type} onChange={(e) => patch("type", e.target.value)}>
                  <option>Multifamily</option>
                  <option>Mixed-Use</option>
                  <option>Retail</option>
                  <option>Office</option>
                  <option>Industrial</option>
                </select>
              </div>
            </div>

            <label className="field-label">Location subtitle (shown on the listing card)</label>
            <input className="field-input mb-4" placeholder="e.g. 1016 E. Division St, Lombard, IL · 12-Unit Multifamily" value={form.location} onChange={(e) => patch("location", e.target.value)} />

            <label className="field-label">Street address</label>
            <input className="field-input mb-4" placeholder="4523 N Magnolia Ave" value={form.address} onChange={(e) => patch("address", e.target.value)} />

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="field-label">City</label>
                <input className="field-input" value={form.city} onChange={(e) => patch("city", e.target.value)} />
              </div>
              <div>
                <label className="field-label">State</label>
                <input className="field-input" value={form.state} onChange={(e) => patch("state", e.target.value)} />
              </div>
              <div>
                <label className="field-label">ZIP</label>
                <input className="field-input" value={form.zip} onChange={(e) => patch("zip", e.target.value)} />
              </div>
            </div>
            <label className="field-label mt-4">Neighborhood</label>
            <input className="field-input" value={form.neighborhood} onChange={(e) => patch("neighborhood", e.target.value)} />
          </div>

          {/* Building & financials */}
          <div className="card p-6">
            <div className="section-header">Building & financials</div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div><label className="field-label">Units</label><input className="field-input" value={form.units} onChange={(e) => patch("units", e.target.value)} /></div>
              <div><label className="field-label">Total sqft</label><input className="field-input" value={form.total_sqft} onChange={(e) => patch("total_sqft", e.target.value)} /></div>
              <div><label className="field-label">Year built</label><input className="field-input" value={form.year_built} onChange={(e) => patch("year_built", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="field-label">Sale price</label><input className="field-input" placeholder="$4,400,000" value={form.sale_price} onChange={(e) => patch("sale_price", e.target.value)} /></div>
              <div><label className="field-label">Sale date</label><input type="date" className="field-input" value={form.sale_date} onChange={(e) => patch("sale_date", e.target.value)} /></div>
              <div><label className="field-label">Cap rate</label><input className="field-input" placeholder="6.4%" value={form.cap_rate} onChange={(e) => patch("cap_rate", e.target.value)} /></div>
            </div>
          </div>

          {/* Description */}
          <div className="card p-6">
            <div className="section-header">Description</div>
            <label className="field-label">Short description (1-2 lines, used in SEO meta)</label>
            <input className="field-input mb-4" value={form.description} onChange={(e) => patch("description", e.target.value)} />
            <label className="field-label">Full body</label>
            <textarea className="field-input" rows={8} value={form.body} onChange={(e) => patch("body", e.target.value)} placeholder="A pristine 24-unit walkup in the heart of Uptown..." />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Save</h4>
            <p className="text-xs text-slate-500 mb-3">Required: property name. Everything else can be edited after.</p>
            {error ? <div className="text-xs text-red-600 mb-3">{error}</div> : null}
            <button type="submit" disabled={saving || uploading} className="w-full btn-primary text-sm py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving..." : uploading ? "Uploading photos..." : "Create listing"}
            </button>
            <Link href="/admin/listings" className="block text-center w-full btn-ghost text-sm py-2.5 rounded-lg mt-2">Cancel</Link>
          </div>
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-2">What happens next</h4>
            <p className="text-xs text-slate-500">After saving, you&apos;ll land on the full editor where you can add highlights, assign brokers, set SEO fields, etc. The listing publishes to the live site within 60 seconds.</p>
          </div>
        </div>
      </form>
    </>
  );
}
