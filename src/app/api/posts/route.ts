import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getPosts, createPost } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { requireApproved } from "@/lib/access";
import { cleanPostInput, readJsonBody } from "@/lib/validate";

export async function GET() {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const list = await getPosts();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const clean = cleanPostInput(body);
  const slug = (typeof clean.slug === "string" && clean.slug) || slugify(String(clean.title || "new-post"));
  try {
    const created = await createPost({ ...clean, slug });
    revalidateTag("posts");
    revalidatePath("/blog");
    revalidatePath("/");
    revalidatePath(`/blog/${slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/posts failed:", err);
    return NextResponse.json({ error: "Could not create post" }, { status: 400 });
  }
}
