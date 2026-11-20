import { getProperties } from "@/lib/data";
import ListingsBrowser from "./ListingsBrowser";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const properties = await getProperties();
  return <ListingsBrowser properties={properties} />;
}
