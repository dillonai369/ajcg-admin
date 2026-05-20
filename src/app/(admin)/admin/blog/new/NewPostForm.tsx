"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileText } from "lucide-react";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewPostForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    category: "Market Updates",
    status: "draft",
    body_text: "",
  });
  const [heroImage, setHeroImage] = useState("");
  const [heroAlt, setHeroAlt] = useState("");

  function patch<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "blog-images");
      const r = await fetch("/api/upload", { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      const { url } = (await r.json()) as { url: string };
      setHeroImage(url);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    try {
      const slug = slugify(form.title);
      // Build a single starter block from the body text so the editor has content.
      const blocks = form.body_text.trim()
        ? [
            {
              id: `b-${Date.now()}`,
              type: "paragraph" as const,
              text: form.body_text,
            },
          ]
        : [];
      const body = {
        slug,
        title: form.title,
        excerpt: form.excerpt || null,
        category: form.category,
        status: form.status,
        hero_image: heroImage || null,
        hero_alt: heroAlt || null,
        blocks,
      };
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(await r.text());
      router.push(`/admin/blog/${slug}`);
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
          <Link href="/admin/blog" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">New post</h1>
            <p className="text-xs text-slate-500">Start a blog post. You can fill in block-based content after saving.</p>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving || uploading} className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50">
          {saving ? "Saving..." : "Create post"}
        </button>
      </header>

      <form onSubmit={handleSave} className="p-8 grid grid-cols-3 gap-6 max-w-6xl">
        <div className="col-span-2 space-y-4">
          {/* Title + excerpt */}
          <div className="card p-6">
            <div className="section-header"><FileText className="w-4 h-4" /> Post basics</div>
            <label className="field-label">Title *</label>
            <input className="field-input mb-4 text-lg font-semibold" placeholder="Why We Sold $24M of Inventory in Q1" value={form.title} onChange={(e) => patch("title", e.target.value)} />
            <label className="field-label">Excerpt (one-line summary shown in cards + meta description)</label>
            <textarea className="field-input" rows={2} value={form.excerpt} onChange={(e) => patch("excerpt", e.target.value)} placeholder="Inside our record-setting Q1: five north-side closings, $24.3M in volume." />
          </div>

          {/* Hero */}
          <div className="card p-6">
            <div className="section-header">Hero image</div>
            <label className="upload-zone rounded-lg p-8 text-center cursor-pointer block">
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={heroImage} alt="" className="w-full aspect-[16/9] object-cover rounded mb-2" />
              ) : (
                <>
                  <Upload className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                  <div className="text-sm font-medium">{uploading ? "Uploading..." : "Click to upload hero image"}</div>
                  <div className="text-xs text-slate-500 mt-1">Recommended 1600×900</div>
                </>
              )}
            </label>
            {heroImage ? (
              <>
                <label className="field-label mt-3">Alt text (for SEO + accessibility)</label>
                <input className="field-input" placeholder="Describe the image" value={heroAlt} onChange={(e) => setHeroAlt(e.target.value)} />
              </>
            ) : null}
          </div>

          {/* Initial body */}
          <div className="card p-6">
            <div className="section-header">Starter content</div>
            <p className="text-xs text-slate-500 -mt-3 mb-4">Optional. Anything you write here becomes the first paragraph block. You can add headings, images, quotes, lists, etc. in the block editor after saving.</p>
            <textarea className="field-input" rows={8} placeholder="Start writing... or paste in rough notes — you'll edit them with the block-based editor next." value={form.body_text} onChange={(e) => patch("body_text", e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Save</h4>
            <label className="field-label">Status</label>
            <select className="field-input mb-3" value={form.status} onChange={(e) => patch("status", e.target.value)}>
              <option value="draft">Draft (not visible to public)</option>
              <option value="published">Publish now</option>
              <option value="scheduled">Scheduled (set date in editor)</option>
            </select>
            <label className="field-label">Category</label>
            <select className="field-input mb-4" value={form.category} onChange={(e) => patch("category", e.target.value)}>
              <option>Market Updates</option>
              <option>Investor Insights</option>
              <option>Neighborhood Spotlights</option>
              <option>Recent Deals</option>
              <option>Disposition Strategy</option>
              <option>Market Watch</option>
              <option>Tax Strategy</option>
              <option>Capital Markets</option>
              <option>Buyer Strategy</option>
              <option>Market Trends</option>
              <option>Insights</option>
            </select>
            {error ? <div className="text-xs text-red-600 mb-3">{error}</div> : null}
            <button type="submit" disabled={saving || uploading} className="w-full btn-primary text-sm py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {saving ? "Saving..." : uploading ? "Uploading..." : "Create post"}
            </button>
            <Link href="/admin/blog" className="block text-center w-full btn-ghost text-sm py-2.5 rounded-lg mt-2">Cancel</Link>
          </div>
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-2">What happens next</h4>
            <p className="text-xs text-slate-500">After saving, you&apos;ll land on the block-based editor where you can add paragraphs, headings, photo galleries, quotes, and lists. Published posts appear on /blog within 60 seconds.</p>
          </div>
        </div>
      </form>
    </>
  );
}
