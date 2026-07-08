import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getPost, savePost, deletePost } from "@/lib/data";
import { requireApproved } from "@/lib/access";
import { cleanPostInput, readJsonBody } from "@/lib/validate";

type Ctx = { params: Promise<{ slug: string }> };

function invalidatePublicCaches(slug: string) {
  revalidateTag("posts");
  revalidatePath("/blog");
  revalidatePath("/");
  revalidatePath(`/blog/${slug}`);
}

export async function GET(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const item = await getPost(slug);
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
    const updated = await savePost(slug, cleanPostInput(body));
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    invalidatePublicCaches(slug);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error(`PUT /api/posts/${slug} failed:`, err);
    return NextResponse.json({ error: "Could not save post" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const { slug } = await ctx.params;
  const ok = await deletePost(slug);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  invalidatePublicCaches(slug);
  return NextResponse.json({ ok: true });
}
