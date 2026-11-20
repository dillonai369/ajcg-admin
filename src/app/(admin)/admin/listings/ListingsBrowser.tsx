"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Property } from "@/lib/types";
import ListingCard from "@/components/ListingCard";

const FILTERS: Array<{ value: string; label: string }> = [
  { value: "", label: "All listings" },
  { value: "for sale", label: "For sale" },
  { value: "under contract", label: "Under contract" },
  { value: "coming soon", label: "Coming soon" },
  { value: "sold", label: "Sold" },
  { value: "draft", label: "Drafts" },
];

/**
 * Search + status filter for the admin listings grid.
 *
 * The page used to render a status dropdown that wasn't wired to anything and
 * had no search at all — with 88 listings, finding one meant scrolling the
 * whole grid (which is how "how do I find/remove the Roselle 16-unit" became a
 * support request). Filtering is done in the browser: the list is already
 * loaded and is small.
 */
export default function ListingsBrowser({ properties }: { properties: Property[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of properties) {
      const s = (p.status || "draft").toLowerCase();
      c[s] = (c[s] || 0) + 1;
    }
    return c;
  }, [properties]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (status && (p.status || "draft").toLowerCase() !== status) return false;
      if (!needle) return true;
      const hay = [p.name, p.location, p.address, p.city, p.zip, p.neighborhood, p.submarket, p.slug, p.units ? `${p.units} unit` : ""]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      // Every word must appear somewhere, so "roselle 16" finds the 16-unit in Roselle.
      return needle.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [properties, q, status]);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Listings</h1>
          <p className="text-sm text-slate-500">
            {shown.length === properties.length
              ? `${properties.length} listings`
              : `Showing ${shown.length} of ${properties.length} listings`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search address, town, units…"
              aria-label="Search listings"
              className="text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 bg-white w-72"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
                {f.value ? ` (${counts[f.value] || 0})` : ""}
              </option>
            ))}
          </select>
          <Link href="/admin/listings/new" className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add listing
          </Link>
        </div>
      </header>

      <div className="p-8">
        {shown.length === 0 ? (
          <div className="card p-10 text-center text-sm text-slate-500">
            No listings match{q ? ` “${q}”` : ""}.{" "}
            <button type="button" className="underline" onClick={() => { setQ(""); setStatus(""); }}>
              Clear filters
            </button>
          </div>
        ) : null}
        <div className="grid grid-cols-3 gap-5">
          {shown.map((p) => (
            <ListingCard key={p.slug} property={p} />
          ))}
          {!q && !status ? (
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
          ) : null}
        </div>
      </div>
    </>
  );
}
