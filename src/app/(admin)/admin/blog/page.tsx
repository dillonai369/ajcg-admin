import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { getPosts } from "@/lib/data";
import Pill, { PillVariant } from "@/components/ui/Pill";

function statusVariant(s: string): PillVariant {
  const l = s.toLowerCase();
  if (l === "published") return "green";
  if (l === "draft") return "amber";
  if (l === "scheduled") return "purple";
  return "gray";
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Blog</h1>
          <p className="text-sm text-slate-500">Publish articles to ajcommercialgroup.com/blog</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
            <option>All posts</option>
            <option>Published</option>
            <option>Drafts</option>
            <option>Scheduled</option>
          </select>
          <Link href="/admin/blog/new" className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New post
          </Link>
        </div>
      </header>

      <div className="p-8">
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Post</th>
                <th className="text-left px-5 py-3 font-medium">Category</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Views</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((p) => (
                <tr key={p.slug} className="table-row">
                  <td className="px-5 py-4">
                    <Link href={`/admin/blog/${p.slug}`} className="block">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.excerpt}</div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{p.category}</td>
                  <td className="px-5 py-4">
                    <Pill variant={statusVariant(p.status)}>{p.status}</Pill>
                  </td>
                  <td className="px-5 py-4 text-sm">{p.views ?? "—"}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{p.date ?? "—"}</td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/admin/blog/${p.slug}`}>
                      <ChevronRight className="w-4 h-4 text-slate-400 inline" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
