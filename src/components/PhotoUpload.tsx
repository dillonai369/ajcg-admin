"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { ImagePlus, Loader2, Star } from "lucide-react";
import { resolveImageUrl } from "@/lib/utils";
import { uploadImage, isHeic } from "@/lib/client-upload";

export default function PhotoUpload({
  images,
  onChange,
}: {
  images: string[];
  onChange: (next: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  // Uploads each selected file to /api/upload, which stores it in the
  // `property-photos` Supabase Storage bucket and returns a public URL.
  // We then store the URL in the images array. We do NOT embed base64
  // data URLs anymore — those bloated the database to 30MB and made
  // every public page load take 10+ seconds.
  async function uploadFiles(files: File[]) {
    const pics = files.filter((f) => f.type.startsWith("image/") || isHeic(f));
    if (!pics.length) return;
    setUploading(true);
    setProblems([]);
    const uploaded: string[] = [];
    const failed: string[] = [];
    try {
      for (const f of pics) {
        try {
          uploaded.push(await uploadImage(f, "property-photos"));
        } catch (err) {
          failed.push(`${f.name}: ${(err as Error).message}`);
        }
      }
      if (uploaded.length) onChange([...images, ...uploaded]);
      setProblems(failed);
    } finally {
      setUploading(false);
      // Reset the file input so the user can re-upload the same file name if needed
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    void uploadFiles(Array.from(e.target.files ?? []));
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    void uploadFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function removeAt(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  /** Move a photo to the front — the first photo is the hero on the website. */
  function makeHero(idx: number) {
    if (idx === 0) return;
    const next = [...images];
    const [picked] = next.splice(idx, 1);
    onChange([picked, ...next]);
  }

  return (
    <>
      <div
        className={`upload-zone rounded-lg p-8 text-center mb-4 ${uploading ? "opacity-60 pointer-events-none" : "cursor-pointer"} ${dragOver ? "ring-2 ring-blue-400" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <Loader2 className="w-7 h-7 mx-auto text-slate-400 mb-2 animate-spin" />
        ) : (
          <ImagePlus className="w-7 h-7 mx-auto text-slate-400 mb-2" />
        )}
        <div className="text-sm font-medium">
          {uploading ? "Uploading…" : "Drop photos here, or click to upload"}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          JPG or PNG · at least 1200px wide · large photos are resized automatically
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

      {problems.length ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700 space-y-1" role="alert">
          {problems.map((p, i) => (
            <div key={i}>{p}</div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-4 gap-3">
        {images.map((src, idx) => (
          <div key={`${src}-${idx}`} className={`photo-thumb ${idx === 0 ? "hero" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resolveImageUrl(src)} alt="" loading="lazy" />
            {idx !== 0 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  makeHero(idx);
                }}
                title="Make this the main (hero) photo"
                aria-label="Make this the main photo"
                className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded z-10 flex items-center gap-1"
              >
                <Star className="w-3 h-3" /> Make hero
              </button>
            ) : null}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeAt(idx);
              }}
              title="Remove photo"
              aria-label="Remove photo"
              className="absolute top-1 right-1 bg-black/60 hover:bg-black/80 text-white text-xs px-1.5 py-0.5 rounded z-10"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {images.length ? (
        <p className="text-xs text-slate-500 mt-3">
          The first photo is the hero image on the website. Use “Make hero” on any other photo to switch.
        </p>
      ) : null}
    </>
  );
}
