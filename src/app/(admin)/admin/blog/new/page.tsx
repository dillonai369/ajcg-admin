import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// TODO: build a real "new post" creation flow that POSTs to /api/posts.

export default function NewPostPage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center gap-3">
        <Link href="/admin/blog" className="btn-ghost p-2 rounded-lg inline-flex">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-lg font-semibold">New post</h1>
          <p className="text-xs text-slate-500">Coming soon — for now, edit an existing post.</p>
        </div>
      </header>
      <div className="p-8">
        <div className="card p-8 max-w-xl">
          <p className="text-sm text-slate-600">
            A blank-slate creation form ships in a follow-up. The block-based post editor at{" "}
            <code className="text-xs bg-slate-50 px-1.5 py-0.5 rounded">/blog/[slug]</code> is fully functional
            for editing your existing posts.
          </p>
          <Link href="/admin/blog" className="btn-primary text-sm px-4 py-2 rounded-lg inline-block mt-4">
            Back to blog
          </Link>
        </div>
      </div>
    </>
  );
}
