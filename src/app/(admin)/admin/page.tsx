import { Eye, Mail, Building2, Search, FileText, UsersRound } from "lucide-react";
import { getBrokers, getProperties, getPosts } from "@/lib/data";
import StatCard from "@/components/StatCard";
import TrafficChart from "@/components/TrafficChart";

export default async function OverviewPage() {
  const [brokers, properties, posts] = await Promise.all([getBrokers(), getProperties(), getPosts()]);

  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Good morning, Joey</h1>
          <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening on ajcommercialgroup.com</p>
        </div>
        <select className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white">
          <option>Last 30 days</option>
          <option>Last 7 days</option>
          <option>Last 90 days</option>
        </select>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard label="Site Visitors" value="8,412" delta="+11% vs last month" deltaDirection="up" icon={Eye} />
          <StatCard label="Form Submissions" value="47" delta="+23% vs last month" deltaDirection="up" icon={Mail} />
          <StatCard label="Active Listings" value={properties.length} icon={Building2} hint={`${posts.length} blog posts · ${brokers.length} brokers`} />
          <StatCard label="Avg. Keyword Rank" value="7.4" delta="Up 2.1 positions" deltaDirection="up" icon={Search} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card p-5 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Site traffic — last 30 days</h3>
              <div className="flex gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--navy)" }} /> Visitors
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} /> Form fills
                </span>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <TrafficChart />
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4">Top pages</h3>
            <div className="space-y-3">
              {[
                { title: "Home", path: "/", views: "3,214", delta: "+18%", up: true },
                { title: "Sold Listings", path: "/sold", views: "1,847", delta: "+34%", up: true },
                { title: "Our Team", path: "/brokers", views: "1,124", delta: "+22%", up: true },
                { title: "Q1 Market Recap", path: "/blog/q1-2026...", views: "621", delta: "+212%", up: true },
                { title: "Contact", path: "/contact", views: "418", delta: "-4%", up: false },
              ].map((row) => (
                <div key={row.title} className="flex items-center justify-between text-sm">
                  <div className="truncate">
                    <div className="font-medium truncate">{row.title}</div>
                    <div className="text-xs text-slate-500">{row.path}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{row.views}</div>
                    <div className={`text-xs ${row.up ? "stat-up" : "stat-down"}`}>{row.delta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-sm">Recent activity</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { icon: Building2, color: "bg-emerald-100 text-emerald-700", title: "New listing published", sub: `${properties[0]?.name ?? "—"} · by Joey`, when: "2h ago" },
                { icon: FileText, color: "bg-blue-100 text-blue-700", title: "Blog post published", sub: `"${posts[0]?.title?.slice(0, 60) ?? "—"}" · by Anthony`, when: "Yesterday" },
                { icon: Mail, color: "bg-amber-100 text-amber-700", title: "New form submission", sub: "Marcus Reynolds — buyer inquiry", when: "2 days ago" },
                { icon: UsersRound, color: "bg-purple-100 text-purple-700", title: "Broker profile updated", sub: "Anthony Munoz updated bio + photo", when: "3 days ago" },
                { icon: Building2, color: "bg-emerald-100 text-emerald-700", title: "Listing marked Sold", sub: "4421 N Kedzie Ave · $4.85M", when: "5 days ago" },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={i} className="px-5 py-3 flex items-center gap-3 text-sm">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${row.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{row.title}</div>
                      <div className="text-xs text-slate-500">{row.sub}</div>
                    </div>
                    <div className="text-xs text-slate-400">{row.when}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-sm">Recent inquiries</h3>
              <span className="text-xs text-slate-500">From contact form</span>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                { name: "Marcus Reynolds", email: "marcus.r@reynoldscap.com · (312) 555-0142", note: "Looking to acquire 20+ unit buildings in Logan Square", pill: "pill-amber", label: "New" },
                { name: "Priya Shah", email: "priya@shahre.com · (773) 555-0188", note: "Listing inquiry: 4421 N Kedzie — wanting to tour", pill: "pill-amber", label: "New" },
                { name: "David Chen", email: "d.chen@brightoncap.com · (708) 555-0119", note: "Wants to sell 32-unit in Edgewater", pill: "pill-green", label: "Contacted" },
                { name: "Elena Vasquez", email: "elena@vrealty.io · (312) 555-0233", note: "Broker collaboration — North Side properties", pill: "pill-blue", label: "In progress" },
              ].map((q) => (
                <div key={q.name} className="px-5 py-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">{q.name}</div>
                    <span className={`pill ${q.pill}`}>{q.label}</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-1">{q.email}</div>
                  <div className="text-xs text-slate-600">{q.note}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
