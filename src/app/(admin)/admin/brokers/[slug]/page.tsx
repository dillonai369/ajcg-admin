import { notFound } from "next/navigation";
import { getBroker, getProperties } from "@/lib/data";
import BrokerEditor from "./BrokerEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function BrokerEditorPage({ params }: Props) {
  const { slug } = await params;
  const [broker, properties] = await Promise.all([getBroker(slug), getProperties()]);
  if (!broker) notFound();
  // Hand the editor the lightweight property data it needs to populate the
  // "Add to Recent Transactions" picker (slug, name, location, hero photo).
  const propertyOptions = properties.map((p) => ({
    slug: p.slug,
    name: p.name,
    location: p.location || "",
    units: p.units || "",
    type: p.type || "",
    hero_image: p.hero_image || p.images?.[0] || "",
  }));
  return <BrokerEditor initial={broker} properties={propertyOptions} />;
}
