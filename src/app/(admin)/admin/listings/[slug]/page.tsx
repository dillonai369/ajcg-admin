import { notFound } from "next/navigation";
import { getProperty } from "@/lib/data";
import ListingEditor from "./ListingEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function ListingEditorPage({ params }: Props) {
  const { slug } = await params;
  const property = await getProperty(slug);
  if (!property) notFound();
  return <ListingEditor initial={property} />;
}
