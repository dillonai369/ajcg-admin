import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureAndGetUserAccess } from "@/lib/access";

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

  // Generate a unique key: <timestamp>-<sanitized-name>
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 80);
  const key = `${Date.now()}-${safeName}`;

  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabaseAdmin().storage.from(bucket).upload(key, buf, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabaseAdmin().storage.from(bucket).getPublicUrl(key);
  return NextResponse.json({ url: pub.publicUrl, key, bucket });
}
