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
    <aside className="no-print w-64 bg-gradient-to-b from-amber-900 to-amber-800 text-amber-50 flex flex-col min-h-screen shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
            <Gem className="w-5 h-5 text-amber-900" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Tops Style</h1>
            <p className="text-amber-300 text-xs">Jewellery Billing</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
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
                  ? "bg-amber-400 text-amber-900 shadow-md"
                  : "text-amber-200 hover:bg-amber-700 hover:text-amber-50"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-700 text-center text-amber-400 text-xs">
        &copy; {new Date().getFullYear()} Tops Style
      </div>
    </aside>
  );
}
