import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost } from "@/lib/data";
import { slugify } from "@/lib/utils";

export async function GET() {
  const list = await getPosts();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || slugify(body.title || "new-post");
  try {
    const created = await createPost({ ...body, slug });
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
