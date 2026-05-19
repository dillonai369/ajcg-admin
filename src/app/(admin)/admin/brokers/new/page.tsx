import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// TODO: build a real "new broker" creation flow that POSTs to /api/brokers.

export default function NewBrokerPage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center gap-3">
        <Link href="/admin/brokers" className="btn-ghost p-2 rounded-lg inline-flex">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">New broker</h1>
          <p className="text-xs text-slate-500">Coming soon — for now, edit an existing broker.</p>
        </div>
      </header>
      <div className="p-8">
        <div className="card p-8 max-w-xl">
          <p className="text-sm text-slate-600">
            A blank-slate creation form ships in a follow-up. The broker editor at{" "}
            <code className="text-xs bg-slate-50 px-1.5 py-0.5 rounded">/brokers/[slug]</code> is fully functional
            for editing your 9 existing team members.
          </p>
          <Link href="/admin/brokers" className="btn-primary text-sm px-4 py-2 rounded-lg inline-block mt-4">
            Back to brokers
          </Link>
        </div>
      </div>
    </>
  );
}
