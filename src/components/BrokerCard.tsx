import Link from "next/link";
import { Mail, Phone, Pencil } from "lucide-react";
import type { Broker } from "@/lib/types";
import { initials, resolveImageUrl } from "@/lib/utils";

export default function BrokerCard({ broker }: { broker: Broker }) {
  const photo = resolveImageUrl(broker.card_photo_url || broker.photo_url);
  return (
    <Link
      href={`/admin/brokers/${broker.slug}`}
      className="card broker-card overflow-hidden cursor-pointer block"
    >
      <div className="p-5 text-center border-b border-slate-100">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt={broker.name}
            className="w-24 h-24 mx-auto rounded-full object-cover mb-3 bg-slate-100"
          />
        ) : (
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-serif text-2xl font-bold mb-3">
            {initials(broker.name)}
          </div>
        )}
        <div className="font-semibold flex items-center justify-center gap-2">
          {broker.name}
          {broker.is_partner ? <span className="pill pill-blue">Partner</span> : null}
        </div>
        <div className="text-xs text-slate-500">{broker.title}</div>
      </div>
      <div className="px-5 py-3 text-xs space-y-1">
        {broker.email ? (
          <div className="flex items-center gap-2 text-slate-600">
            <Mail className="w-3.5 h-3.5" /> {broker.email}
          </div>
        ) : null}
        {broker.phone ? (
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-3.5 h-3.5" /> {broker.phone}
          </div>
        ) : null}
      </div>
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500">Deals:</span>{" "}
          <span className="font-semibold">{broker.track_record?.length ?? 0}</span>
        </div>
        <span className="btn-ghost p-1.5 rounded">
          <Pencil className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
