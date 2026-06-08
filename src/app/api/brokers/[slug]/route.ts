import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getBroker, saveBroker, deleteBroker } from "@/lib/data";

type Ctx = { params: Promise<{ slug: string }> };

function invalidatePublicCaches(slug: string) {
  revalidatePath("/our-team");
  revalidatePath("/");
  revalidatePath(`/broker/${slug}`);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const broker = await getBroker(slug);
  if (!broker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(broker);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const body = await req.json();
  const updated = await saveBroker(slug, body);
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidatePublicCaches(slug);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { slug } = await ctx.params;
  const ok = await deleteBroker(slug);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidatePublicCaches(slug);
  return NextResponse.json({ ok: true });
}
