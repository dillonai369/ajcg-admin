/**
 * Server-side photo normalisation (sharp).
 *
 * Why: the team uploads photos straight from phones/screenshots — 3.9 MB and
 * 3.5 MB PNGs were sitting in the homepage carousel on 2026-10-26 and were
 * most of a 12.4 MB page. The image optimizer (src/lib/image-url.ts) now
 * shields visitors from that, but it still has to pull the full original from
 * Supabase on every cache miss, and the admin UI, Open Graph share cards and
 * anything linking the raw URL get the whole file. So uploads are normalised
 * once, at the door:
 *
 *   • rotated per EXIF, metadata stripped
 *   • downscaled to ≤ MAX_EDGE px on the long side (never enlarged)
 *   • re-encoded: JPEG q82 (mozjpeg) for photos, WebP q82 if the source has
 *     transparency (logos) so alpha survives
 *   • GIFs are left untouched (animation)
 *
 * Used by /api/upload and by supabase/compress-images.ts (existing files).
 */
import sharp from "sharp";

export const MAX_EDGE = 2000;
export const QUALITY = 82;

export type Processed = {
  buffer: Buffer;
  contentType: "image/jpeg" | "image/webp";
  ext: "jpg" | "webp";
  width: number;
  height: number;
  /** True when the source was already small/efficient and we kept its bytes. */
  unchanged: boolean;
};

/**
 * Normalise an image buffer. Returns null for formats we deliberately skip
 * (GIF) or if sharp cannot decode the input — callers should then upload the
 * original bytes as before.
 */
export async function processImage(input: Buffer, mime: string): Promise<Processed | null> {
  if (mime === "image/gif") return null;
  try {
    const img = sharp(input, { failOn: "none" }).rotate();
    const meta = await img.metadata();
    const hasAlpha = Boolean(meta.hasAlpha);

    const pipeline = img.resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    });

    const out = hasAlpha
      ? await pipeline.webp({ quality: QUALITY, effort: 4 }).toBuffer({ resolveWithObject: true })
      : await pipeline.jpeg({ quality: QUALITY, mozjpeg: true, progressive: true }).toBuffer({ resolveWithObject: true });

    // If the re-encode didn't actually help (already a well-compressed JPEG of
    // the same size), keep the original bytes so we never make a file worse.
    const sameDims = (meta.width ?? 0) <= MAX_EDGE && (meta.height ?? 0) <= MAX_EDGE;
    if (sameDims && out.data.length >= input.length * 0.95 && (mime === "image/jpeg" || mime === "image/webp")) {
      return {
        buffer: input,
        contentType: mime,
        ext: mime === "image/jpeg" ? "jpg" : "webp",
        width: meta.width ?? out.info.width,
        height: meta.height ?? out.info.height,
        unchanged: true,
      };
    }

    return {
      buffer: out.data,
      contentType: hasAlpha ? "image/webp" : "image/jpeg",
      ext: hasAlpha ? "webp" : "jpg",
      width: out.info.width,
      height: out.info.height,
      unchanged: false,
    };
  } catch (e) {
    console.error("processImage: sharp failed, keeping original —", (e as Error).message);
    return null;
  }
}
