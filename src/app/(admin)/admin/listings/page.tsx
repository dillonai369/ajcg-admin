import { Plus } from "lucide-react";
import Link from "next/link";
import { getProperties } from "@/lib/data";
import ListingCard from "@/components/ListingCard";

export default async function ListingsPage() {
  const properties = await getProperties();

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Listings</h1>
          <p className="text-sm text-slate-500">Manage active, under contract, and sold properties</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <option>All listings</option>
            <option>For sale</option>
            <option>Under contract</option>
            <option>Sold</option>
            <option>Drafts</option>
          </select>
          <Link
            href="/admin/listings/new"
            className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add listing
          </Link>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-5">
          {properties.map((p) => (
            <ListingCard key={p.slug} property={p} />
          ))}
          <Link
            href="/admin/listings/new"
            className="card listing-card overflow-hidden cursor-pointer flex items-center justify-center"
            style={{ minHeight: 280, borderStyle: "dashed" }}
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-slate-400" />
              </div>
              <div className="font-medium text-sm">Add a new listing</div>
              <div className="text-xs text-slate-500 mt-1">Auto-publishes to your site</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
