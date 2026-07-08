import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProperties, createProperty } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { requireApproved } from "@/lib/access";
import { cleanPropertyInput, readJsonBody } from "@/lib/validate";

export async function GET() {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const list = await getProperties();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const clean = cleanPropertyInput(body);
  const slug = (typeof clean.slug === "string" && clean.slug) || slugify(String(clean.name || "new-listing"));
  try {
    const created = await createProperty({ ...clean, slug });
    // Force-invalidate the cached data + the public pages that show this listing
    revalidateTag("properties");
    revalidatePath("/recently-sold");
    revalidatePath("/");
    revalidatePath(`/property/${slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/properties failed:", err);
    return NextResponse.json({ error: "Could not create listing" }, { status: 400 });
  }
}
