import { BarChart3, Search, Sparkles, Image as ImageIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-500">Team, integrations, and account preferences</p>
      </header>

      <div className="p-8 space-y-4 max-w-3xl">
        <div className="card p-6">
          <h3 className="font-semibold mb-1">Team members</h3>
          <p className="text-xs text-slate-500 mb-4">Both founders have full admin access</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-semibold">
                JB
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Joey Batliner</div>
                <div className="text-xs text-slate-500">jbatliner@ajcommercialgroup.com</div>
              </div>
              <span className="pill pill-blue">Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-semibold">
                AM
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Anthony Munoz</div>
                <div className="text-xs text-slate-500">amunoz@ajcommercialgroup.com</div>
              </div>
              <span className="pill pill-blue">Admin</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-1">Connected services</h3>
          <p className="text-xs text-slate-500 mb-4">Data sources powering this dashboard</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-semibold">GHL</div>
              <div className="flex-1">
                <div className="text-sm font-medium">GoHighLevel</div>
                <div className="text-xs text-slate-500">Marketing site + form submissions</div>
              </div>
              <span className="pill pill-amber">Pending</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Plausible Analytics</div>
                <div className="text-xs text-slate-500">Page views + visitor data</div>
              </div>
              <span className="pill pill-amber">Pending</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">DataForSEO</div>
                <div className="text-xs text-slate-500">Keyword ranks + backlinks</div>
              </div>
              <span className="pill pill-amber">Pending</span>
            </div>
            <div className="flex items-center gap-3 py-2 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Claude (Anthropic API)</div>
                <div className="text-xs text-slate-500">AI drafting for blogs + listings</div>
              </div>
              <span className="pill pill-amber">Pending</span>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Supabase Storage</div>
                <div className="text-xs text-slate-500">Image hosting + optimization</div>
              </div>
              <span className="pill pill-amber">Pending</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold mb-1">Notifications</h3>
          <p className="text-xs text-slate-500 mb-4">Email alerts</p>
          <label className="flex items-center gap-3 py-2 text-sm">
            <input type="checkbox" defaultChecked /> New form submission (instant)
          </label>
          <label className="flex items-center gap-3 py-2 text-sm">
            <input type="checkbox" defaultChecked /> Weekly performance summary (Mondays)
          </label>
          <label className="flex items-center gap-3 py-2 text-sm">
            <input type="checkbox" /> Keyword rank changes (top 10 only)
          </label>
        </div>
      </div>
    </>
  );
}
