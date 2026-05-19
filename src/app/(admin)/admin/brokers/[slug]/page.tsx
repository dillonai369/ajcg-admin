import { notFound } from "next/navigation";
import { getBroker } from "@/lib/data";
import BrokerEditor from "./BrokerEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function BrokerEditorPage({ params }: Props) {
  const { slug } = await params;
  const broker = await getBroker(slug);
  if (!broker) notFound();
  return <BrokerEditor initial={broker} />;
}
