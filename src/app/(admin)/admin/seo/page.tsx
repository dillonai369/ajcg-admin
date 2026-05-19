import { Plus } from "lucide-react";

// Note: This page is currently static. Once DataForSEO is wired up via env var,
// swap these arrays for an async fetch and render real keyword rank data.

const KEYWORDS = [
  { kw: "chicago multifamily broker", pos: 3, change: "+2", up: true, vol: "1,300", diff: 42, url: "/services" },
  { kw: "logan square apartment building for sale", pos: 2, change: "+5", up: true, vol: "720", diff: 28, url: "/sold" },
  { kw: "north side chicago commercial real estate", pos: 7, change: "+1", up: true, vol: "880", diff: 38, url: "/" },
  { kw: "sell my apartment building chicago", pos: 11, change: "-3", up: false, vol: "390", diff: 35, url: "/sellers" },
  { kw: "chicagoland investment property broker", pos: 5, change: "+4", up: true, vol: "260", diff: 29, url: "/about" },
  { kw: "edgewater apartment building broker", pos: 4, change: "+6", up: true, vol: "170", diff: 22, url: "/sold" },
  { kw: "multifamily cap rates chicago 2026", pos: 9, change: "+12", up: true, vol: "110", diff: 31, url: "/blog/q1-2026-market-recap" },
  { kw: "uptown apartment investment", pos: 6, change: "+3", up: true, vol: "90", diff: 18, url: "/sold" },
];

export default function SEOPage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">SEO</h1>
          <p className="text-sm text-slate-500">Keyword rankings, top pages, backlinks, and competitor benchmarks</p>
        </div>
        <button className="btn-ghost text-sm px-3 py-2 rounded-lg flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Track new keyword
        </button>
      </header>

      <div className="p-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Tracked keywords</div>
            <div className="text-2xl font-semibold">42</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">In top 10</div>
            <div className="text-2xl font-semibold">18</div>
            <div className="text-xs stat-up mt-1">+4 this month</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Domain authority</div>
            <div className="text-2xl font-semibold">28</div>
            <div className="text-xs stat-up mt-1">+2 this quarter</div>
          </div>
          <div className="card p-5">
            <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Backlinks</div>
            <div className="text-2xl font-semibold">147</div>
            <div className="text-xs stat-up mt-1">+12 new</div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Keyword rankings</h3>
            <div className="flex items-center gap-2">
              <input className="text-sm border border-slate-200 rounded-lg px-3 py-1.5" placeholder="Search keywords…" />
              <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white">
                <option>All keywords</option>
                <option>Top 10</option>
                <option>Top 20</option>
                <option>Movers</option>
              </select>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Keyword</th>
                <th className="text-left px-5 py-3 font-medium">Position</th>
                <th className="text-left px-5 py-3 font-medium">Change</th>
                <th className="text-left px-5 py-3 font-medium">Volume / mo</th>
                <th className="text-left px-5 py-3 font-medium">Difficulty</th>
                <th className="text-left px-5 py-3 font-medium">Ranking URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {KEYWORDS.map((k) => (
                <tr key={k.kw}>
                  <td className="px-5 py-3 font-medium">{k.kw}</td>
                  <td className="px-5 py-3 font-semibold">{k.pos}</td>
                  <td className={`px-5 py-3 ${k.up ? "stat-up" : "stat-down"}`}>
                    {k.up ? "▲" : "▼"} {k.change.replace(/[+-]/, "")}
                  </td>
                  <td className="px-5 py-3">{k.vol}</td>
                  <td className="px-5 py-3 text-slate-500">{k.diff}</td>
                  <td className="px-5 py-3 text-xs text-slate-500">{k.url}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Top performing pages (SEO)</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between"><span><strong>Sold listings</strong> · /sold</span><span className="font-medium">12 keywords</span></div>
              <div className="flex items-center justify-between"><span><strong>Services</strong> · /services</span><span className="font-medium">8 keywords</span></div>
              <div className="flex items-center justify-between"><span><strong>Q1 Recap blog</strong> · /blog/…</span><span className="font-medium">6 keywords</span></div>
              <div className="flex items-center justify-between"><span><strong>About</strong> · /about</span><span className="font-medium">4 keywords</span></div>
              <div className="flex items-center justify-between"><span><strong>Home</strong> · /</span><span className="font-medium">3 keywords</span></div>
            </div>
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Recent backlinks</h3>
            <div className="space-y-3 text-sm">
              <div><div className="font-medium">traded.co</div><div className="text-xs text-slate-500">&ldquo;AJ Commercial Group closes $4.85M deal…&rdquo; · DA 64</div></div>
              <div><div className="font-medium">crexi.com</div><div className="text-xs text-slate-500">Brokerage profile listing · DA 71</div></div>
              <div><div className="font-medium">connectcre.com</div><div className="text-xs text-slate-500">Chicago multifamily market article · DA 58</div></div>
              <div><div className="font-medium">therealdeal.com</div><div className="text-xs text-slate-500">North side closings roundup · DA 79</div></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
