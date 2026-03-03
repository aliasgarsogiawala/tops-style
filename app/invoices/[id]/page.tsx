"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInvoices } from "@/lib/storage";
import { Invoice } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowLeft, Printer, Gem } from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const invoices = getInvoices();
    const found = invoices.find((inv) => inv.id === params.id);
    if (found) setInvoice(found);
    else router.push("/invoices");
  }, [params.id, router]);

  if (!invoice) {
    return (
      <div className="p-8 text-center text-amber-400">
        <p>Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Actions bar — hidden on print */}
      <div className="no-print flex items-center justify-between mb-6">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-amber-800 text-amber-50 px-5 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-md"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* Invoice Document */}
      <div
        id="invoice-print"
        className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-900 to-amber-700 text-amber-50 p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
                <Gem className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tops Style</h1>
                <p className="text-amber-300 text-sm">Fine Jewellery</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-amber-300 text-sm font-medium uppercase tracking-wide">Invoice</p>
              <p className="text-2xl font-bold mt-1">{invoice.invoiceNumber}</p>
              <p className="text-amber-300 text-sm mt-1">{formatDateTime(invoice.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 border-b border-amber-100 bg-amber-50">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold mb-1">Bill To</p>
              <p className="font-semibold text-amber-900 text-lg">
                {invoice.customerName || "Walk-in Customer"}
              </p>
              {invoice.customerPhone && (
                <p className="text-amber-700 text-sm">{invoice.customerPhone}</p>
              )}
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-amber-200">
                <th className="text-left py-2 text-amber-700 font-semibold text-sm pb-3">Code</th>
                <th className="text-center py-2 text-amber-700 font-semibold text-sm pb-3">Qty</th>
                <th className="text-right py-2 text-amber-700 font-semibold text-sm pb-3">Unit Price</th>
                <th className="text-right py-2 text-amber-700 font-semibold text-sm pb-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`border-b border-amber-50 ${idx % 2 === 0 ? "" : "bg-amber-50/50"}`}
                >
                  <td className="py-3 pr-4">
                    <span className="font-mono text-sm font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      {item.productCode}
                    </span>
                  </td>
                  <td className="py-3 text-center text-amber-700">{item.quantity}</td>
                  <td className="py-3 text-right text-amber-700">{formatCurrency(item.price)}</td>
                  <td className="py-3 text-right font-semibold text-amber-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-6 pb-6">
          <div className="ml-auto w-64 space-y-2">
            <div className="flex justify-between text-amber-700 text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-green-600 text-sm">
                <span>
                  Discount{" "}
                  {invoice.discountType === "percent"
                    ? `(${invoice.discount}%)`
                    : ""}
                </span>
                <span>
                  -{" "}
                  {formatCurrency(
                    invoice.discountType === "percent"
                      ? (invoice.subtotal * invoice.discount) / 100
                      : invoice.discount
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-amber-900 text-lg pt-2 border-t-2 border-amber-200">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="px-6 pb-6">
            <p className="text-xs uppercase tracking-wide text-amber-500 font-semibold mb-1">Notes</p>
            <p className="text-amber-700 text-sm">{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="bg-amber-900 text-amber-300 text-center py-4 text-xs">
          Thank you for choosing Tops Style Jewellery
        </div>
      </div>
    </div>
  );
}
