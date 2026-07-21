import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureAndGetUserAccess } from "@/lib/access";

/** Return the real image MIME type from magic bytes, or null if not an image. */
function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // GIF: "GIF8"
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return "image/gif";
  // WebP: "RIFF"...."WEBP"
  if (
    buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
    buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50
  ) return "image/webp";
  return null;
}

// POST /api/upload  multipart/form-data with:
//   - file: the image
//   - bucket: "broker-photos" | "property-photos" | "blog-images"
// Returns: { url: string }
export async function POST(req: Request) {
  const me = await ensureAndGetUserAccess();
  if (!me || me.status !== "approved") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const file = form.get("file");
  const bucket = String(form.get("bucket") || "");
  const allowedBuckets = new Set(["broker-photos", "property-photos", "blog-images"]);
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (!allowedBuckets.has(bucket)) {
    return NextResponse.json({ error: `invalid bucket: ${bucket}` }, { status: 400 });
  }

  // Size cap (10 MB) — reject before buffering the whole thing into memory.
  const MAX_BYTES = 10 * 1024 * 1024;
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file too large (max 10 MB)" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());

  // Verify it's actually an image by sniffing magic bytes — don't trust the
  // client-supplied file.type. Covers JPEG, PNG, GIF, WebP.
  const sniffed = sniffImageType(buf);
  if (!sniffed) {
    return NextResponse.json({ error: "only JPEG, PNG, GIF, or WebP images are allowed" }, { status: 415 });
  }

  // Generate a unique key: <timestamp>-<sanitized-name>
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const key = `${Date.now()}-${safeName}`;

  const { error } = await supabaseAdmin().storage.from(bucket).upload(key, buf, {
    contentType: sniffed,
    upsert: false,
  });
  if (error) {
    console.error("POST /api/upload — storage upload failed:", error);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }

  const { data: pub } = supabaseAdmin().storage.from(bucket).getPublicUrl(key);
  return NextResponse.json({ url: pub.publicUrl, key, bucket });
}
