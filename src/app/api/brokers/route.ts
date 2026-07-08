import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBrokers, createBroker } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { requireApproved } from "@/lib/access";
import { cleanBrokerInput, readJsonBody } from "@/lib/validate";

export async function GET() {
  const gate = await requireApproved();
  if (gate.response) return gate.response;
  const brokers = await getBrokers();
  return NextResponse.json(brokers);
}

export async function POST(req: Request) {
  const gate = await requireApproved();
  if (gate.response) return gate.response;

  const body = await readJsonBody(req);
  if (!body) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });

  const clean = cleanBrokerInput(body);
  const slug = (typeof clean.slug === "string" && clean.slug) || slugify(String(clean.name || "new-broker"));
  try {
    const created = await createBroker({ ...clean, slug });
    revalidateTag("brokers");
    revalidatePath("/our-team");
    revalidatePath("/");
    revalidatePath(`/broker/${slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/brokers failed:", err);
    return NextResponse.json({ error: "Could not create broker" }, { status: 400 });
  }
}
