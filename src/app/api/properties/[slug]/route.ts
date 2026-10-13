import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProperty, saveProperty, deleteProperty } from "@/lib/data";
import { requireApproved } from "@/lib/access";
import { cleanPropertyInput, readJsonBody } from "@/lib/validate";
import { withListingSeoDefaults } from "@/lib/listing-seo";
import type { Property } from "@/lib/types";

type Ctx = { params: Promise<{ slug: string }> };

function invalidatePublicCaches(slug: string) {
  revalidateTag("properties");
  revalidatePath("/recently-sold");
  revalidatePath("/");
  revalidatePath(`/property/${slug}`);
}

export async function GET(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const item = await getProperty(slug);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  try {
    const clean = cleanPropertyInput(body);
    // Blank SEO fields get the house template (Mary's format) so every
    // listing ships with a proper title/description without anyone typing it.
    const existing = await getProperty(slug);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const patch = withListingSeoDefaults(clean, { ...existing, ...clean } as Property);
    const updated = await saveProperty(slug, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    invalidatePublicCaches(slug);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(`PUT /api/properties/${slug} failed:`, err);
    return NextResponse.json({ error: "Could not save listing" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const ok = await deleteProperty(slug);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidatePublicCaches(slug);
  return NextResponse.json({ ok: true });
}
