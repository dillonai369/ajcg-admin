import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProperties, createProperty } from "@/lib/data";
import { slugify } from "@/lib/utils";

export async function GET() {
  const list = await getProperties();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || slugify(body.name || "new-listing");
  try {
    const created = await createProperty({ ...body, slug });
    // Force-invalidate the cached data + the public pages that show this listing
    revalidateTag("properties");
    revalidatePath("/recently-sold");
    revalidatePath("/");
    revalidatePath(`/property/${slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
