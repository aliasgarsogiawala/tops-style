"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getProducts, getInvoices } from "@/lib/storage";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Package, FileText, IndianRupee, TrendingUp, Plus, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInvoices: 0,
    totalRevenue: 0,
    todayRevenue: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<ReturnType<typeof getInvoices>>([]);

  useEffect(() => {
    const products = getProducts();
    const invoices = getInvoices();
    const today = new Date().toDateString();

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const todayRevenue = invoices
      .filter((inv) => new Date(inv.createdAt).toDateString() === today)
      .reduce((sum, inv) => sum + inv.grandTotal, 0);

    setStats({
      totalProducts: products.length,
      totalInvoices: invoices.length,
      totalRevenue,
      todayRevenue,
    });

    setRecentInvoices(invoices.slice(-5).reverse());
  }, []);

  const statCards = [
    {
      label: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "bg-amber-100 text-amber-700",
      iconBg: "bg-amber-200",
    },
    {
      label: "Total Invoices",
      value: stats.totalInvoices,
      icon: FileText,
      color: "bg-orange-100 text-orange-700",
      iconBg: "bg-orange-200",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      color: "bg-yellow-100 text-yellow-700",
      iconBg: "bg-yellow-200",
    },
    {
      label: "Today's Revenue",
      value: formatCurrency(stats.todayRevenue),
      icon: TrendingUp,
      color: "bg-lime-100 text-lime-700",
      iconBg: "bg-lime-200",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-amber-900">Dashboard</h2>
        <p className="text-amber-700 mt-1">Welcome back to Tops Style Billing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl p-5 shadow-sm border border-amber-100 ${card.color}`}
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
          className="flex items-center gap-4 p-5 bg-amber-800 text-amber-50 rounded-2xl hover:bg-amber-700 transition-colors shadow-md group"
        >
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Create New Invoice</p>
            <p className="text-amber-300 text-sm">Enter product codes to build a bill</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/products"
          className="flex items-center gap-4 p-5 bg-white text-amber-900 rounded-2xl hover:bg-amber-50 transition-colors shadow-md border border-amber-200 group"
        >
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-lg">Manage Products</p>
            <p className="text-amber-600 text-sm">Add, edit or delete product codes</p>
          </div>
          <ArrowRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-amber-100">
          <h3 className="font-semibold text-amber-900 text-lg">Recent Invoices</h3>
          <Link
            href="/invoices"
            className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1"
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="p-12 text-center text-amber-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">Create your first invoice to see it here</p>
          </div>
        ) : (
          <div className="divide-y divide-amber-50">
            {recentInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-4 hover:bg-amber-50 transition-colors">
                <div>
                  <p className="font-medium text-amber-900">{inv.invoiceNumber}</p>
                  <p className="text-sm text-amber-600">{inv.customerName || "Walk-in Customer"}</p>
                  <p className="text-xs text-amber-400">{formatDateTime(inv.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-amber-800">{formatCurrency(inv.grandTotal)}</p>
                  <p className="text-xs text-amber-500">{inv.items.length} item(s)</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
