"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ImagePlus, LayoutList } from "lucide-react";
import type { Post } from "@/lib/types";
import { Field, FieldInput, FieldSelect, FieldTextarea, FieldLabel } from "@/components/ui/FieldInput";
import BlockEditor from "@/components/BlockEditor";
import { AIBlogPanel } from "@/components/AIAssistPanel";

const CATEGORY_OPTIONS = [
  "Market Updates",
  "Investor Insights",
  "Neighborhood Spotlights",
  "Recent Deals",
  "Disposition Strategy",
  "Market Watch",
  "Tax Strategy",
  "Capital Markets",
  "Buyer Strategy",
  "Market Trends",
];

export default function PostEditor({ initial }: { initial: Post }) {
  const [form, setForm] = useState<Post>({
    ...initial,
    blocks: initial.blocks ?? [
      { id: "intro", type: "paragraph", text: initial.excerpt },
    ],
    tags: initial.tags ?? [],
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

  function patch(p: Partial<Post>) {
    setForm((f) => ({ ...f, ...p }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/${form.slug}`, {
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

  function addTag() {
    const t = newTag.trim();
    if (!t) return;
    patch({ tags: [...(form.tags ?? []), t] });
    setNewTag("");
  }
  function removeTag(i: number) {
    patch({ tags: (form.tags ?? []).filter((_, idx) => idx !== i) });
  }

  const metaTitleLen = (form.meta_title ?? "").length;
  const metaDescLen = (form.meta_description ?? "").length;

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/blog" className="btn-ghost p-2 rounded-lg inline-flex">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold">Edit post</h1>
            <p className="text-xs text-slate-500">Block-based editor · saves on demand</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {savedAt ? (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <Check className="w-3 h-3" /> Saved at {savedAt}
            </span>
          ) : null}
          {error ? <span className="text-xs text-red-600">{error}</span> : null}
          <button
            type="button"
            onClick={() => {
              import("@/lib/utils").then(({ publicSiteUrl }) => {
                window.open(publicSiteUrl(`/blog/${form.slug}`), "_blank", "noopener,noreferrer");
              });
            }}
            className="btn-ghost text-sm px-3 py-2 rounded-lg"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="btn-primary text-sm px-4 py-2 rounded-lg font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : "Publish"}
          </button>
        </div>
      </header>

      <div className="p-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="card p-6">
            <input
              className="w-full text-3xl font-semibold mb-3 focus:outline-none placeholder-slate-300"
              placeholder="Post title…"
              value={form.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <input
              className="w-full text-base text-slate-600 mb-5 focus:outline-none placeholder-slate-300"
              placeholder="One-line excerpt (shown in card previews + meta description)"
              value={form.excerpt}
              onChange={(e) => patch({ excerpt: e.target.value })}
            />

            <FieldLabel>Hero image URL</FieldLabel>
            <FieldInput
              placeholder="https://…"
              value={form.hero_image ?? ""}
              onChange={(e) => patch({ hero_image: e.target.value })}
              className="mb-2"
            />
            {form.hero_image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.hero_image} alt="" className="rounded-lg mb-2 w-full max-h-64 object-cover" />
            ) : (
              <div className="upload-zone rounded-lg p-6 text-center cursor-pointer mb-2">
                <ImagePlus className="w-7 h-7 mx-auto text-slate-400 mb-2" />
                <div className="text-sm font-medium">Paste a URL above, or drop hero image</div>
                <div className="text-xs text-slate-500 mt-1">Recommended 1600×900 · auto-optimized</div>
              </div>
            )}
            <FieldInput
              placeholder="Alt text — describe the image for SEO + accessibility"
              value={form.hero_alt ?? ""}
              onChange={(e) => patch({ hero_alt: e.target.value })}
            />
          </div>

          <div className="card p-6">
            <div className="section-header"><LayoutList className="w-4 h-4" /> Content blocks</div>
            <p className="text-xs text-slate-500 -mt-3 mb-5">
              Add paragraphs, headings, photos, galleries, quotes, lists — mix and match.
            </p>
            <BlockEditor blocks={form.blocks ?? []} onChange={(blocks) => patch({ blocks })} />
          </div>

          <AIBlogPanel
            getBody={() => (form.blocks ?? []).map((b) => b.text || "").join("\n\n").trim()}
            getTitle={() => form.title}
            getExcerpt={() => form.excerpt ?? ""}
            onBodyResult={(text) => {
              // Append polished/expanded text as a new paragraph block
              const newBlock = { id: `ai-${Date.now()}`, type: "paragraph" as const, text };
              patch({ blocks: [...(form.blocks ?? []), newBlock] });
            }}
            onMetaResult={(meta) => {
              patch({
                meta_title: meta.title ?? form.meta_title,
                meta_description: meta.description ?? form.meta_description,
              });
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Publish</h4>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-slate-600">Status</span>
              <FieldSelect
                className="!w-auto text-xs !py-1"
                value={form.status}
                onChange={(e) => patch({ status: e.target.value })}
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </FieldSelect>
            </div>
            <button onClick={save} disabled={saving} className="w-full btn-primary text-sm py-2.5 rounded-lg font-semibold mb-2 disabled:opacity-50">
              {saving ? "Saving…" : "Save post"}
            </button>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Author</h4>
            <FieldSelect value={form.author ?? "Joey Batliner"} onChange={(e) => patch({ author: e.target.value })}>
              <option>Joey Batliner</option>
              <option>Anthony Munoz</option>
              <option>Merry Galindo</option>
            </FieldSelect>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">SEO</h4>
            <FieldLabel>URL slug</FieldLabel>
            <FieldInput className="text-xs font-mono mb-3" value={form.slug} readOnly />
            <FieldLabel>Meta title <span className="text-slate-400 normal-case">(60 char)</span></FieldLabel>
            <FieldInput
              className="mb-1"
              value={form.meta_title ?? ""}
              onChange={(e) => patch({ meta_title: e.target.value })}
            />
            <div className="text-xs text-slate-400 mb-3 text-right">{metaTitleLen} / 60</div>
            <FieldLabel>Meta description <span className="text-slate-400 normal-case">(160 char)</span></FieldLabel>
            <FieldTextarea
              rows={3}
              value={form.meta_description ?? ""}
              onChange={(e) => patch({ meta_description: e.target.value })}
            />
            <div className="text-xs text-slate-400 mt-1 text-right">{metaDescLen} / 160</div>
          </div>

          <div className="card p-5">
            <h4 className="font-semibold text-sm mb-3">Category</h4>
            <Field label="">
              <FieldSelect className="mb-3" value={form.category} onChange={(e) => patch({ category: e.target.value })}>
                {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                {CATEGORY_OPTIONS.includes(form.category) ? null : <option>{form.category}</option>}
              </FieldSelect>
            </Field>
            <h4 className="font-semibold text-sm mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1 mb-2">
              {(form.tags ?? []).map((t, i) => (
                <button
                  key={`${t}-${i}`}
                  type="button"
                  onClick={() => removeTag(i)}
                  className="pill pill-gray cursor-pointer"
                >
                  {t} ×
                </button>
              ))}
            </div>
            <FieldInput
              className="text-xs"
              placeholder="Add tag…"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
