import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

export default function StatCard({
  label,
  value,
  delta,
  deltaDirection,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  icon?: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
        {Icon ? <Icon className="w-4 h-4 text-slate-400" /> : null}
      </div>
      <div className="text-3xl font-semibold">{value}</div>
      {delta ? (
        <div
          className={`text-xs mt-2 flex items-center gap-1 ${
            deltaDirection === "down" ? "stat-down" : deltaDirection === "up" ? "stat-up" : "text-slate-500"
          }`}
        >
          {deltaDirection === "up" ? <TrendingUp className="w-3 h-3" /> : null}
          {deltaDirection === "down" ? <TrendingDown className="w-3 h-3" /> : null}
          {delta}
        </div>
      ) : hint ? (
        <div className="text-xs mt-2 text-slate-500">{hint}</div>
      ) : null}
    </div>
  );
}
