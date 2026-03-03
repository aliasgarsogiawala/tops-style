"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getInvoices, deleteInvoice } from "@/lib/storage";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Search,
  FileText,
  Trash2,
  Eye,
  X,
  Plus,
} from "lucide-react";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => setInvoices(getInvoices().slice().reverse());
  useEffect(() => load(), []);

  const filtered = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerPhone.includes(search)
  );

  function handleDelete(id: string) {
    deleteInvoice(id);
    load();
    setDeleteConfirm(null);
  }

  const totalRevenue = invoices.reduce((s, inv) => s + inv.grandTotal, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-900">Invoice History</h2>
          <p className="text-amber-700 mt-1">
            {invoices.length} invoice(s) &mdash; Total Revenue:{" "}
            <span className="font-semibold">{formatCurrency(totalRevenue)}</span>
          </p>
        </div>
        <Link
          href="/invoice/new"
          className="flex items-center gap-2 bg-amber-800 text-amber-50 px-5 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          New Invoice
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
        <input
          type="text"
          placeholder="Search by invoice no., customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-amber-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-300"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-400 hover:text-amber-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-amber-400">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No invoices found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search" : "Create your first invoice to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Invoice #</th>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Customer</th>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Date</th>
                <th className="text-center p-4 text-amber-700 font-semibold text-sm">Items</th>
                <th className="text-right p-4 text-amber-700 font-semibold text-sm">Amount</th>
                <th className="text-right p-4 text-amber-700 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-amber-50 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg text-sm">
                      {inv.invoiceNumber}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-amber-900">
                      {inv.customerName || "Walk-in Customer"}
                    </p>
                    {inv.customerPhone && (
                      <p className="text-xs text-amber-500">{inv.customerPhone}</p>
                    )}
                  </td>
                  <td className="p-4 text-amber-700 text-sm">{formatDateTime(inv.createdAt)}</td>
                  <td className="p-4 text-center text-amber-700 text-sm">{inv.items.length}</td>
                  <td className="p-4 text-right font-bold text-amber-800">
                    {formatCurrency(inv.grandTotal)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm(inv.id)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Delete Invoice?</h3>
            <p className="text-amber-600 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 bg-red-500 text-white px-4 py-2.5 rounded-xl hover:bg-red-600 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
