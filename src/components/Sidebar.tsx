"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileText,
  UsersRound,
  Search,
  Settings,
  ChevronsUpDown,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/admin" },
  { href: "/admin/listings", label: "Listings", icon: Building2, match: (p: string) => p.startsWith("/admin/listings") },
  { href: "/admin/blog", label: "Blog", icon: FileText, match: (p: string) => p.startsWith("/admin/blog") },
  { href: "/admin/brokers", label: "Brokers", icon: UsersRound, match: (p: string) => p.startsWith("/admin/brokers") },
  { href: "/admin/seo", label: "SEO", icon: Search, match: (p: string) => p.startsWith("/admin/seo") },
];

export default function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="sidebar w-60 flex-shrink-0 flex flex-col">
      <div className="px-5 py-6 border-b border-white/10 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/logo/aj-logo-white.png"
          alt="AJ Commercial Group"
          className="h-12 w-auto"
        />
      </div>

      <nav className="flex-1 py-4 px-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${active ? "active" : ""} flex items-center gap-2.5 px-3 py-2 rounded text-sm`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        <div className="text-xs uppercase tracking-wider text-slate-400 px-3 mb-2 mt-6">Account</div>
        <Link
          href="/admin/settings"
          className={`nav-item ${pathname.startsWith("/admin/settings") ? "active" : ""} flex items-center gap-2.5 px-3 py-2 rounded text-sm`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </nav>

      <div className="px-3 py-4 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-semibold">
            JB
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-xs font-medium truncate">Joey Batliner</div>
            <div className="text-slate-300 text-xs truncate">Admin</div>
          </div>
          <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
