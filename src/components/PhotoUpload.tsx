"use client";

import { ChangeEvent, useRef, useState } from "react";
import { ImagePlus, GripVertical, Loader2 } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export default function PhotoUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  // Uploads each selected file to /api/upload, which stores it in the
  // `property-photos` Supabase Storage bucket and returns a public URL.
  // We then store the URL in the images array. We do NOT embed base64
  // data URLs anymore — those bloated the database to 30MB and made
  // every public page load take 10+ seconds.
  async function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    const uploaded: string[] = [];
    try {
      for (const f of files) {
        const fd = new FormData();
        fd.append("file", f);
        fd.append("bucket", "property-photos");
        const r = await fetch("/api/upload", { method: "POST", body: fd });
        if (!r.ok) {
          const err = await r.text().catch(() => "");
          alert(`Upload failed for ${f.name}: ${err || r.statusText}`);
          continue;
        }
        const { url } = (await r.json()) as { url: string };
        uploaded.push(url);
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
    } finally {
      setUploading(false);
      // Reset the file input so the user can re-upload the same file name if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <>
      <div
        className={`upload-zone rounded-lg p-8 text-center mb-4 ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"}`}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? (
          <Loader2 className="w-7 h-7 mx-auto text-slate-400 mb-2 animate-spin" />
        ) : (
          <ImagePlus className="w-7 h-7 mx-auto text-slate-400 mb-2" />
        )}
        <div className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drop photos here, or click to upload"}
        </div>
        <div className="text-xs text-slate-500 mt-1">JPG, PNG, HEIC · up to 20MB each</div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        {images.map((src, idx) => (
          <div key={idx} className={`photo-thumb ${idx === 0 ? "hero" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImageUrl(src)} alt="" />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeAt(idx);
              }}
              className="absolute top-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded z-10"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {images.length ? (
        <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
          <GripVertical className="w-3 h-3" /> First photo = hero image
        </p>
      ) : null}
    </>
  );
}
