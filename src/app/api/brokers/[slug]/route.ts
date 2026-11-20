import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBroker, saveBroker, deleteBroker } from "@/lib/data";
import { requireApproved } from "@/lib/access";
import { cleanBrokerInput, readJsonBody } from "@/lib/validate";
import { audit } from "@/lib/audit";

type Ctx = { params: Promise<{ slug: string }> };

function invalidatePublicCaches(slug: string) {
  revalidateTag("brokers");
  revalidatePath("/our-team");
  revalidatePath("/");
  revalidatePath(`/broker/${slug}`);
}

export async function GET(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const broker = await getBroker(slug);
  if (!broker) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(broker);
}

export async function PUT(req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  try {
    const updated = await saveBroker(slug, cleanBrokerInput(body));
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    invalidatePublicCaches(slug);
    audit("broker.updated", `broker:${slug}`, gate.user.email, `${gate.user.email} edited broker ${updated.name}`);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(`PUT /api/brokers/${slug} failed:`, err);
    return NextResponse.json({ error: "Could not save broker" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  try {
    const existing = await getBroker(slug);
    const ok = await deleteBroker(slug);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    invalidatePublicCaches(slug);
    audit("broker.deleted", `broker:${slug}`, gate.user.email, `${gate.user.email} deleted broker ${existing?.name ?? slug}`);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error(`DELETE /api/brokers/${slug} failed:`, err);
    return NextResponse.json({ error: "Could not delete broker" }, { status: 500 });
  }
}
