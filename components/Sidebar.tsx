"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  History,
  Gem,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/invoice/new", label: "New Invoice", icon: FileText },
  { href: "/invoices", label: "Invoice History", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print w-64 bg-zinc-950 border-r border-zinc-800 text-white flex flex-col h-screen fixed top-0 left-0 shadow-sm z-50">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-400 rounded-full flex items-center justify-center">
            <Gem className="w-5 h-5 text-zinc-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Tops Style</h1>
            <p className="text-zinc-300 text-xs">Jewellery Billing</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                active
                  ? "bg-zinc-100 text-zinc-900 font-semibold shadow-sm"
                  : "text-zinc-200 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-700 text-center text-zinc-400 text-xs">
        &copy; {new Date().getFullYear()} Tops Style
      </div>
    </aside>
  );
}
