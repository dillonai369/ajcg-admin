import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { screenBasic, clientIpFrom } from "@/lib/spam";

/**
 * POST /api/resume — public. Stores a careers-form résumé in the PRIVATE
 * "resumes" bucket and returns its storage path for the inquiry row.
 *
 * Why this exists: the careers form had a file input, but SmartForm serialized
 * files to "" — every résumé ever submitted was silently discarded while the
 * applicant saw "Thanks — we got it."
 *
 * Nothing here is publicly readable. Admins get a short-lived signed URL from
 * the lead detail page.
 */
// Vercel rejects request bodies over ~4.5 MB before the handler runs, so the
// limit we enforce (and tell applicants about) has to sit under that.
const MAX_BYTES = 4 * 1024 * 1024;

function sniffDocType(buf: Buffer): { ext: string; mime: string } | null {
  if (buf.length < 8) return null;
  // PDF: "%PDF"
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) return { ext: "pdf", mime: "application/pdf" };
  // DOCX (and other OOXML): "PK\x03\x04" — we accept it as docx; Word opens it or it doesn't.
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) {
    return { ext: "docx", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
  }
  // Legacy DOC: OLE compound file "D0 CF 11 E0 A1 B1 1A E1"
  if (buf[0] === 0xd0 && buf[1] === 0xcf && buf[2] === 0x11 && buf[3] === 0xe0) return { ext: "doc", mime: "application/msword" };
  return null;
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: "Uploads are not available right now." }, { status: 503 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const ip = clientIpFrom(req.headers);
  const verdict = screenBasic({
    honeypot: form.get("website_url"),
    formElapsedMs: form.get("__form_elapsed_ms"),
    formLoadedAt: form.get("__form_loaded_at"),
    ip,
  });
  if (verdict.spam) {
    console.log("[resume drop]", verdict.reason, { ip });
    // Same play as the lead endpoints: look successful, store nothing.
    return NextResponse.json({ path: null });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Résumé must be under 4 MB." }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const kind = sniffDocType(buf);
  if (!kind) {
    return NextResponse.json({ error: "Please upload a PDF or Word document." }, { status: 415 });
  }

  const safeName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60) || "resume";
  const key = `${new Date().toISOString().slice(0, 10)}/${Date.now()}-${safeName}.${kind.ext}`;

  const { error } = await supabaseAdmin().storage.from("resumes").upload(key, buf, {
    contentType: kind.mime,
    upsert: false,
  });
  if (error) {
    console.error("POST /api/resume — storage upload failed:", error);
    return NextResponse.json({ error: "Upload failed. You can email your résumé to contact@ajcommercialgroup.com instead." }, { status: 500 });
  }

  return NextResponse.json({ path: key });
}
