/**
 * Browser-side image upload used by every admin photo picker.
 *
 * One place for three things each picker used to get wrong on its own:
 *
 *  1. SIZE. The hosting platform rejects any request over ~4.5 MB before our
 *     code runs, and phone photos are routinely 5–12 MB — the upload just
 *     failed with a raw platform error. Large photos are now shrunk in the
 *     browser first (longest side 2400px, JPEG). The server normalises to
 *     2000px anyway, so nothing visible is lost.
 *  2. HEIC. iPhone HEIC files can't be shown on the web; say so plainly
 *     instead of failing with "only JPEG, PNG…".
 *  3. ERRORS. Show the server's sentence, not a JSON blob.
 */
const DIRECT_UPLOAD_LIMIT = 3.5 * 1024 * 1024;
const CLIENT_MAX_EDGE = 2400;

export type UploadBucket = "property-photos" | "broker-photos" | "blog-images";

export function isHeic(file: File): boolean {
  return /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);
}

async function shrinkIfNeeded(file: File): Promise<File> {
  if (file.size <= DIRECT_UPLOAD_LIMIT || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, CLIENT_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.88));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    // Browser couldn't decode it — send as-is and let the server explain.
    return file;
  }
}

async function readError(r: Response): Promise<string> {
  if (r.status === 413) return "That file is too large. Export a smaller copy of the photo and try again.";
  if (r.status === 401 || r.status === 403) return "Your session expired. Refresh the page, sign in again, and retry.";
  const text = await r.text().catch(() => "");
  try {
    const parsed = JSON.parse(text) as { error?: string };
    if (parsed?.error) return parsed.error;
  } catch {
    /* not JSON */
  }
  return text.slice(0, 200) || r.statusText || `Upload failed (${r.status})`;
}

/** Upload one image; resolves to its public URL or throws an Error with a human-readable message. */
export async function uploadImage(file: File, bucket: UploadBucket): Promise<string> {
  if (isHeic(file)) {
    throw new Error(
      'This is an iPhone HEIC file, which websites can\'t display. Email or AirDrop the photo to yourself choosing "Most Compatible" (JPEG) and upload that copy.',
    );
  }
  const body = new FormData();
  body.append("file", await shrinkIfNeeded(file));
  body.append("bucket", bucket);
  const r = await fetch("/api/upload", { method: "POST", body });
  if (!r.ok) throw new Error(await readError(r));
  const { url } = (await r.json()) as { url: string };
  return url;
}
