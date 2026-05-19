import { Plus, UserPlus } from "lucide-react";
import Link from "next/link";
import { getBrokers } from "@/lib/data";
import BrokerCard from "@/components/BrokerCard";

export default async function BrokersPage() {
  const brokers = await getBrokers();

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Brokers</h1>
          <p className="text-sm text-slate-500">Manage broker profiles displayed on the team page</p>
        </div>
        <Link
          href="/admin/brokers/new"
          className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add broker
        </Link>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-5">
          {brokers.map((b) => (
            <BrokerCard key={b.slug} broker={b} />
          ))}
          <Link
            href="/admin/brokers/new"
            className="card broker-card overflow-hidden cursor-pointer flex items-center justify-center"
            style={{ minHeight: 320, borderStyle: "dashed" }}
          >
            <div className="text-center p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <UserPlus className="w-6 h-6 text-slate-400" />
              </div>
              <div className="font-medium text-sm">Add a broker</div>
              <div className="text-xs text-slate-500 mt-1">Auto-publishes to /brokers</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
