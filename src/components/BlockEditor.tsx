"use client";

import {
  AlignLeft,
  Heading2,
  Image as ImageIcon,
  Grid3x3,
  Quote,
  List,
  Video,
  Minus,
  Square,
  GripVertical,
  Copy,
  Trash2,
} from "lucide-react";
import type { PostBlock, PostBlockType } from "@/lib/types";

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function blockLabel(type: PostBlockType): string {
  switch (type) {
    case "paragraph": return "Paragraph";
    case "heading": return "Heading 2";
    case "image": return "Image with caption";
    case "gallery": return "Photo gallery";
    case "quote": return "Quote";
    case "list": return "Bulleted list";
    case "video": return "Video embed";
    case "divider": return "Divider";
    case "cta": return "CTA button";
  }
}

function BlockIcon({ type }: { type: PostBlockType }) {
  const cls = "w-3 h-3";
  switch (type) {
    case "paragraph": return <AlignLeft className={cls} />;
    case "heading": return <Heading2 className={cls} />;
    case "image": return <ImageIcon className={cls} />;
    case "gallery": return <Grid3x3 className={cls} />;
    case "quote": return <Quote className={cls} />;
    case "list": return <List className={cls} />;
    case "video": return <Video className={cls} />;
    case "divider": return <Minus className={cls} />;
    case "cta": return <Square className={cls} />;
  }
}

const ADD_BUTTONS: { type: PostBlockType; label: string; Icon: typeof AlignLeft }[] = [
  { type: "paragraph", label: "Paragraph", Icon: AlignLeft },
  { type: "heading", label: "Heading", Icon: Heading2 },
  { type: "image", label: "Image", Icon: ImageIcon },
  { type: "gallery", label: "Gallery", Icon: Grid3x3 },
  { type: "quote", label: "Quote", Icon: Quote },
  { type: "list", label: "List", Icon: List },
  { type: "video", label: "Video embed", Icon: Video },
  { type: "divider", label: "Divider", Icon: Minus },
  { type: "cta", label: "CTA button", Icon: Square },
];

export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: PostBlock[];
  onChange: (next: PostBlock[]) => void;
}) {
  function add(type: PostBlockType) {
    onChange([...blocks, { id: genId(), type, text: "", caption: "", attribution: "", images: [] }]);
  }
  function update(id: string, patch: Partial<PostBlock>) {
    onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }
  function remove(id: string) {
    onChange(blocks.filter((b) => b.id !== id));
  }
  function duplicate(id: string) {
    const idx = blocks.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const copy = { ...blocks[idx], id: genId() };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    onChange(next);
  }

  return (
    <div>
      <div className="space-y-3 ml-7">
        {blocks.map((b) => (
          <div key={b.id} className="block-editor-block">
            <div className="flex items-center justify-between mb-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <BlockIcon type={b.type} /> {blockLabel(b.type)}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => duplicate(b.id)} className="btn-ghost p-1 rounded">
                  <Copy className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => remove(b.id)} className="btn-ghost p-1 rounded">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {b.type === "paragraph" ? (
              <textarea
                className="w-full text-sm leading-relaxed focus:outline-none resize-none"
                rows={3}
                value={b.text ?? ""}
                onChange={(e) => update(b.id, { text: e.target.value })}
                placeholder="Write a paragraph…"
              />
            ) : null}

            {b.type === "heading" ? (
              <input
                className="w-full text-xl font-semibold focus:outline-none"
                value={b.text ?? ""}
                onChange={(e) => update(b.id, { text: e.target.value })}
                placeholder="Heading text…"
              />
            ) : null}

            {b.type === "image" ? (
              <div>
                <input
                  className="field-input mb-2"
                  value={b.url ?? ""}
                  onChange={(e) => update(b.id, { url: e.target.value })}
                  placeholder="Image URL…"
                />
                {b.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.url} alt="" className="rounded-lg mb-2 w-full max-h-72 object-cover" />
                ) : (
                  <div className="photo-thumb mb-2" style={{ aspectRatio: "16/9" }} />
                )}
                <input
                  className="w-full text-xs italic text-slate-500 focus:outline-none"
                  placeholder="Image caption…"
                  value={b.caption ?? ""}
                  onChange={(e) => update(b.id, { caption: e.target.value })}
                />
              </div>
            ) : null}

            {b.type === "gallery" ? (
              <div className="grid grid-cols-3 gap-2">
                {(b.images && b.images.length ? b.images : ["", "", ""]).map((src, i) => (
                  <div key={i} className="photo-thumb">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={src} alt="" />
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}

            {b.type === "quote" ? (
              <div className="border-l-4 border-amber-400 pl-3">
                <textarea
                  className="w-full text-base italic focus:outline-none resize-none"
                  rows={2}
                  value={b.text ?? ""}
                  onChange={(e) => update(b.id, { text: e.target.value })}
                  placeholder="Quote text…"
                />
                <input
                  className="w-full text-xs text-slate-500 mt-1 focus:outline-none"
                  placeholder="— Attribution"
                  value={b.attribution ?? ""}
                  onChange={(e) => update(b.id, { attribution: e.target.value })}
                />
              </div>
            ) : null}

            {b.type === "list" ? (
              <textarea
                className="w-full text-sm focus:outline-none resize-none"
                rows={4}
                value={b.text ?? ""}
                onChange={(e) => update(b.id, { text: e.target.value })}
                placeholder="• One item per line"
              />
            ) : null}

            {b.type === "video" ? (
              <input
                className="field-input"
                placeholder="YouTube or Vimeo URL…"
                value={b.url ?? ""}
                onChange={(e) => update(b.id, { url: e.target.value })}
              />
            ) : null}

            {b.type === "divider" ? <hr className="border-slate-200" /> : null}

            {b.type === "cta" ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  className="field-input"
                  placeholder="Button label"
                  value={b.text ?? ""}
                  onChange={(e) => update(b.id, { text: e.target.value })}
                />
                <input
                  className="field-input"
                  placeholder="Link URL"
                  value={b.url ?? ""}
                  onChange={(e) => update(b.id, { url: e.target.value })}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-3 gap-2">
          {ADD_BUTTONS.map(({ type, label, Icon }) => (
            <button
              type="button"
              key={type}
              onClick={() => add(type)}
              className="add-block-btn"
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
