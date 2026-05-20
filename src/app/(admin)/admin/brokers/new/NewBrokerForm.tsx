"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, UserCircle } from "lucide-react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewBrokerForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    title: "Broker",
    email: "",
    phone: "",
    tagline: "",
    bio: "",
    is_partner: false,
  });
  const [heroPhoto, setHeroPhoto] = useState("");
  const [cardPhoto, setCardPhoto] = useState("");

  function patch<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "broker-photos");
    const r = await fetch("/api/upload", { method: "POST", body: fd });
    if (!r.ok) throw new Error(await r.text());
    const { url } = (await r.json()) as { url: string };
    return url;
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, target: "hero" | "card") {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (target === "hero") {
        setHeroPhoto(url);
        if (!cardPhoto) setCardPhoto(url);
      } else {
        setCardPhoto(url);
        if (!heroPhoto) setHeroPhoto(url);
      }
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("First and last name are required");
      return;
    }
    setSaving(true);
    try {
      const fullName = `${form.first_name} ${form.last_name}`.trim();
      const slug = slugify(fullName);
      const body = {
        slug,
        name: fullName,
        title: form.title,
        email: form.email || null,
        phone: form.phone || null,
        tagline: form.tagline || null,
        bio: form.bio || null,
        photo_url: heroPhoto || null,
        card_photo_url: cardPhoto || heroPhoto || null,
        is_partner: form.is_partner,
        display_order: 99,
        track_record: [],
      };
      const r = await fetch("/api/brokers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      router.push(`/admin/brokers/${slug}`);
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
          <Link href="/admin/brokers" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Add broker</h1>
            <p className="text-xs text-slate-500">Adds to /our-team and creates an individual broker page</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || uploading} className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Create broker"}
        </button>
      </header>

      <form onSubmit={handleSave} className="p-8 grid grid-cols-3 gap-6 max-w-6xl">
        <div className="col-span-2 space-y-4">
          {/* Headshot */}
          <div className="card p-6">
            <div className="section-header"><UserCircle className="w-4 h-4" /> Headshot</div>
            <div className="flex gap-6">
              <div className="text-center">
                {heroPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={heroPhoto} alt="" className="w-32 h-32 rounded-full object-cover bg-slate-100" />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-slate-200 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-slate-400" />
                  </div>
                )}
                <label className="block mt-2 cursor-pointer text-xs btn-ghost border border-slate-200 px-2 py-1 rounded">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "hero")} disabled={uploading} />
                  {heroPhoto ? "Change" : "Upload hero photo"}
                </label>
                <div className="text-[10px] text-slate-400 mt-1">Used on /broker/[slug]</div>
              </div>
              <div className="text-center">
                {cardPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cardPhoto} alt="" className="w-32 h-32 rounded object-cover bg-slate-100" />
                ) : (
                  <div className="w-32 h-32 rounded bg-slate-200 flex items-center justify-center">
                    <Upload className="w-7 h-7 text-slate-400" />
                  </div>
                )}
                <label className="block mt-2 cursor-pointer text-xs btn-ghost border border-slate-200 px-2 py-1 rounded">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, "card")} disabled={uploading} />
                  {cardPhoto ? "Change" : "Upload card photo"}
                </label>
                <div className="text-[10px] text-slate-400 mt-1">Used on /our-team grid</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Upload just one photo and we&apos;ll use it for both. Or upload separate ones for cleaner cropping.</p>
          </div>

          {/* Identity */}
          <div className="card p-6">
            <div className="section-header">Identity</div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="field-label">First name *</label><input className="field-input" value={form.first_name} onChange={(e) => patch("first_name", e.target.value)} /></div>
              <div><label className="field-label">Last name *</label><input className="field-input" value={form.last_name} onChange={(e) => patch("last_name", e.target.value)} /></div>
            </div>
            <label className="field-label">Title</label>
            <select className="field-input mb-4" value={form.title} onChange={(e) => patch("title", e.target.value)}>
              <option>Partner / Broker</option>
              <option>Senior Broker</option>
              <option>Broker</option>
              <option>Associate Broker</option>
              <option>Broker Associate</option>
              <option>Transaction Coordinator</option>
            </select>
            <label className="field-label">Tagline (one line shown under name)</label>
            <input className="field-input mb-4" placeholder="North-side multifamily specialist · $80M+ closed since 2018" value={form.tagline} onChange={(e) => patch("tagline", e.target.value)} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_partner} onChange={(e) => patch("is_partner", e.target.checked)} />
              Mark as Partner / Founder (gets special "partner" card styling on /our-team)
            </label>
          </div>

          {/* Contact */}
          <div className="card p-6">
            <div className="section-header">Contact</div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="field-label">Email</label><input className="field-input" type="email" value={form.email} onChange={(e) => patch("email", e.target.value)} /></div>
              <div><label className="field-label">Phone</label><input className="field-input" placeholder="(224) 401-9152" value={form.phone} onChange={(e) => patch("phone", e.target.value)} /></div>
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6">
            <div className="section-header">Bio</div>
            <textarea className="field-input" rows={8} placeholder="A short professional bio — 150-300 words. Can be edited later." value={form.bio} onChange={(e) => patch("bio", e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Save</h4>
            <p className="text-xs text-slate-500 mb-3">Required: first and last name.</p>
            {error ? <div className="text-xs text-red-600 mb-3">{error}</div> : null}
            <button type="submit" disabled={saving || uploading} className="w-full btn-primary text-sm py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving..." : uploading ? "Uploading photo..." : "Create broker"}
            </button>
            <Link href="/admin/brokers" className="block text-center w-full btn-ghost text-sm py-2.5 rounded-lg mt-2">Cancel</Link>
          </div>
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-2">What happens next</h4>
            <p className="text-xs text-slate-500">After saving, you&apos;ll land on the full editor with specialties, license #, education, recent transactions, and team-page display order. The broker appears on /our-team within 60 seconds.</p>
          </div>
        </div>
      </form>
    </>
  );
}
