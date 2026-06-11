/**
 * Instant loading skeleton for any admin page.
 *
 * Next.js renders this immediately when the user clicks a sidebar tab,
 * while the underlying server component fetches data. That removes the
 * "frozen for a second" feeling between tab switches — the sidebar stays
 * put (rendered by the layout) and this skeleton fills the main area.
 */
export default function AdminLoading() {
  return (
    <>
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
        <div>
          <div className="h-6 w-48 rounded bg-slate-200 animate-pulse" />
          <div className="mt-2 h-3 w-72 rounded bg-slate-100 animate-pulse" />
        </div>
        <div className="h-8 w-32 rounded bg-slate-100 animate-pulse" />
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <div className="h-3 w-20 rounded bg-slate-200 animate-pulse mb-3" />
              <div className="h-8 w-16 rounded bg-slate-200 animate-pulse mb-2" />
              <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>

        <div className="card p-6">
          <div className="h-4 w-40 rounded bg-slate-200 animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
                <div className="h-3 w-16 rounded bg-slate-100 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
