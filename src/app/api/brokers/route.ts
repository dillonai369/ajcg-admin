import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { getBrokers, createBroker } from "@/lib/data";
import { slugify } from "@/lib/utils";

export async function GET() {
  const brokers = await getBrokers();
  return NextResponse.json(brokers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const slug = body.slug || slugify(body.name || "new-broker");
  try {
    const created = await createBroker({ ...body, slug });
    revalidateTag("brokers");
    revalidatePath("/our-team");
    revalidatePath("/");
    revalidatePath(`/broker/${slug}`);
    return NextResponse.json(created, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
