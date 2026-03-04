"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ConvexInvoice, ConvexProduct } from "@/lib/types";
import { Package, FileText, IndianRupee, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const products = useQuery(api.products.list) as ConvexProduct[] | undefined;
  const invoices = useQuery(api.invoices.list) as ConvexInvoice[] | undefined;

  const loading = products === undefined || invoices === undefined;

  const today = new Date().toDateString();
  const totalRevenue = (invoices ?? []).reduce((sum, inv) => sum + inv.grandTotal, 0);
  const todayRevenue = (invoices ?? [])
    .filter((inv) => new Date(inv._creationTime).toDateString() === today)
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const recentInvoices = (invoices ?? []).slice(0, 5);

  const statCards = [
    {
      label: "Total Products",
      value: loading ? "—" : (products ?? []).length,
      icon: Package,
      color: "bg-zinc-100 text-zinc-700",
      iconBg: "bg-zinc-200",
    },
    {
      label: "Total Invoices",
      value: loading ? "—" : (invoices ?? []).length,
      icon: FileText,
      color: "bg-zinc-100 text-zinc-700",
      iconBg: "bg-zinc-200",
    },
    {
      label: "Total Revenue",
      value: loading ? "—" : formatCurrency(totalRevenue),
      icon: IndianRupee,
      color: "bg-zinc-100 text-zinc-700",
      iconBg: "bg-zinc-200",
    },
    {
      label: "Today's Revenue",
      value: loading ? "—" : formatCurrency(todayRevenue),
      icon: TrendingUp,
      color: "bg-zinc-100 text-zinc-700",
      iconBg: "bg-zinc-200",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900">Dashboard</h2>
        <p className="text-zinc-700 mt-1">Welcome back to Tops Style Billing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl p-5 shadow-sm border border-zinc-100 ${card.color}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium opacity-80">{card.label}</span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${card.iconBg}`}>
                <card.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/invoice/new"
          className="flex items-center gap-4 p-5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 transition-colors shadow-md group"
        >
          <div className="w-12 h-12 bg-zinc-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Create New Invoice</p>
            <p className="text-zinc-300 text-sm">Enter product codes to build a bill</p>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-4 p-5 bg-white text-zinc-900 rounded-xl hover:bg-zinc-50 transition-colors shadow-md border border-zinc-200 group"
        >
          <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-zinc-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Manage Products</p>
            <p className="text-zinc-600 text-sm">Add, edit or delete product codes</p>
          </div>
          <ArrowRight className="w-5 h-5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100">
          <h3 className="font-semibold text-zinc-900 text-lg">Recent Invoices</h3>
          <Link
            href="/invoices"
            className="text-sm text-zinc-600 hover:text-zinc-900 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400">
            <p className="font-medium">Loading...</p>
          </div>
        ) : recentInvoices.length === 0 ? (
          <div className="p-12 text-center text-zinc-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Create your first invoice to see it here</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {recentInvoices.map((inv) => (
              <div key={inv._id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="font-medium text-zinc-900">{inv.invoiceNumber}</p>
                  <p className="text-sm text-zinc-600">{inv.customerName || "Walk-in Customer"}</p>
                  <p className="text-xs text-zinc-400">{formatDateTime(new Date(inv._creationTime).toISOString())}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-zinc-900">{formatCurrency(inv.grandTotal)}</p>
                  <p className="text-xs text-zinc-400">{inv.items.length} item(s)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
