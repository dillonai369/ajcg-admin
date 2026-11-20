import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProperties, createProperty } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { requireApproved } from "@/lib/access";
import { cleanPropertyInput, readJsonBody } from "@/lib/validate";
import { audit } from "@/lib/audit";
import { withListingSeoDefaults } from "@/lib/listing-seo";
import type { Property } from "@/lib/types";

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
  // Always normalise the slug — it becomes a public URL and a storage/DB key,
  // so a hand-posted value with spaces, slashes or capitals must not get through.
  const slug = slugify((typeof clean.slug === "string" && clean.slug) || String(clean.name || "new-listing")) || "new-listing";
  try {
    // New listings get the house SEO template automatically (Mary's format);
    // anything typed into the SEO fields wins over it.
    const withSeo = withListingSeoDefaults({ ...clean, slug }, { ...clean, slug } as Property);
    const created = await createProperty(withSeo);
    // Force-invalidate the cached data + the public pages that show this listing
    revalidateTag("properties");
    revalidatePath("/recently-sold");
    revalidatePath("/");
    revalidatePath(`/property/${slug}`);
    audit("listing.created", `listing:${slug}`, gate.user.email, `${gate.user.email} added listing ${created.name}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/properties failed:", err);
    return NextResponse.json({ error: "Could not create listing" }, { status: 400 });
  }
}
