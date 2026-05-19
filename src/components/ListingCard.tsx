import Link from "next/link";
import { Pencil } from "lucide-react";
import type { Property } from "@/lib/types";
import { resolveImageUrl, statusLabel, statusPillVariant } from "@/lib/utils";
import Pill from "./ui/Pill";

export default function ListingCard({ property }: { property: Property }) {
  const hero = resolveImageUrl(property.hero_image || property.images?.[0] || "");
  const variant = statusPillVariant(property.status);

  return (
    <Link
      href={`/admin/listings/${property.slug}`}
      className="card listing-card overflow-hidden cursor-pointer block"
    >
      <div className="h-44 bg-gradient-to-br from-slate-700 to-slate-900 relative flex items-center justify-center">
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hero} alt={property.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : null}
        <div className="absolute top-3 left-3 z-10">
          <Pill variant={variant}>{statusLabel(property.status)}</Pill>
        </div>
        <div className="absolute bottom-3 right-3 text-white text-xs font-medium opacity-80 z-10">
          {property.images?.length ?? 0} photos
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-500 mb-1">{property.type || "Multifamily"}</div>
        <div className="font-semibold text-sm mb-1 line-clamp-1">{property.name}</div>
        <div className="text-xs text-slate-600 mb-3">
          {property.units ? `${property.units}-unit` : "—"} · {property.type}
        </div>
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 truncate">{property.body || property.description?.slice(0, 60)}</div>
          <span className="btn-ghost p-1.5 rounded">
            <Pencil className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
