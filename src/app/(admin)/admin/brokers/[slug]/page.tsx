import { notFound } from "next/navigation";
import { getBroker, getProperties } from "@/lib/data";
import BrokerEditor from "./BrokerEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function BrokerEditorPage({ params }: Props) {
  const { slug } = await params;
  const [broker, properties] = await Promise.all([getBroker(slug), getProperties()]);
  if (!broker) notFound();
  // Hand the editor the lightweight property data it needs to derive the
  // "Recent transactions" preview (which listings this broker is assigned to).
  // broker_slugs is the field we filter on — the single source of truth.
  const propertyOptions = properties.map((p) => ({
    slug: p.slug,
    name: p.name,
    location: p.location || "",
    units: p.units || "",
    type: p.type || "",
    hero_image: p.hero_image || p.images?.[0] || "",
    broker_slugs: p.broker_slugs || [],
  }));
  return <BrokerEditor initial={broker} properties={propertyOptions} />;
}
