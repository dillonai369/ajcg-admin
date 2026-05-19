"use client";

import { ChangeEvent, useRef } from "react";
import { ImagePlus, GripVertical } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";

export default function PhotoUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const readers = files.map(
      (f) =>
        new Promise<string>((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(f);
        }),
    );
    Promise.all(readers).then((urls) => onChange([...images, ...urls]));
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <>
      <div
        className="upload-zone rounded-lg p-8 text-center mb-4 cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <ImagePlus className="w-7 h-7 mx-auto text-slate-400 mb-2" />
        <div className="text-sm font-medium">Drop photos here, or click to upload</div>
        <div className="text-xs text-slate-500 mt-1">
          JPG, PNG, HEIC · up to 20MB each · auto-optimized to WebP
        </div>
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
