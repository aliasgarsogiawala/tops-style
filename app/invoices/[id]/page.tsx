"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatDate, formatCurrency } from "@/lib/utils";
import { InvoiceItem } from "@/lib/types";
import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoice = useQuery(
    api.invoices.getById,
    params.id ? { id: params.id as Id<"invoices"> } : "skip"
  );

  // If query returned null (not found), redirect
  if (invoice === null) {
    router.push("/invoices");
    return null;
  }

  if (invoice === undefined) {
    return (
      <div className="p-8 text-center text-zinc-400">
        <p>Loading invoice...</p>
      </div>
    );
  }

  const totalBoxes = invoice.items.reduce((s: number, i: { box: number }) => s + i.box, 0);
  const items = invoice.items as InvoiceItem[];

  function handlePrint() {
    // Directly hide sidebar and action bar via JS (beats Tailwind specificity)
    const sidebar = document.querySelector("aside") as HTMLElement | null;
    const actionBar = document.getElementById("__print_hide__") as HTMLElement | null;
    if (sidebar) sidebar.style.display = "none";
    if (actionBar) actionBar.style.display = "none";

    // Inject print styles — injected after Tailwind so they win the cascade
    const style = document.createElement("style");
    style.id = "__print_override__";
    style.innerHTML = `
      @page { size: A5 portrait; margin: 6mm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body, html { background: white !important; margin: 0 !important; padding: 0 !important; }
      body > div { display: block !important; min-height: 0 !important; }
      main { display: block !important; width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
      #invoice-doc-wrapper { padding: 0 !important; max-width: 100% !important; margin: 0 !important; }
      #invoice-doc { width: 100% !important; min-height: calc(297mm - 12mm) !important; border: none !important; box-shadow: none !important; font-family: "Tempus Sans ITC", "TempusSansITC", "Segoe UI", "Trebuchet MS", "Gill Sans", sans-serif !important; display: flex !important; flex-direction: column !important; }
      #invoice-doc table { flex: 1 1 auto !important; }
    `;
    document.head.appendChild(style);

    window.print();

    // Restore everything after print dialog closes
    setTimeout(() => {
      if (sidebar) sidebar.style.display = "";
      if (actionBar) actionBar.style.display = "";
      const injected = document.getElementById("__print_override__");
      if (injected) document.head.removeChild(injected);
    }, 500);
  }

  return (
    <div id="invoice-doc-wrapper" className="p-6 max-w-3xl mx-auto">
      {/* Actions — hidden on print */}
      <div id="__print_hide__" className="flex items-center justify-between mb-5">
        <Link
          href="/invoices"
          className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors font-medium shadow"
        >
          <Printer className="w-4 h-4" />
          Print / Save PDF
        </button>
      </div>

      {/* ── INVOICE DOCUMENT ── */}
      <div
        id="invoice-doc"
        className="bg-[#fdfbf0] border border-gray-300 font-tempus text-[13px] text-gray-900 flex flex-col"
        style={{ minHeight: "257mm" }}
      >
        {/* ── TOP HEADER ── */}
        <div className="border-b border-gray-400 grid grid-cols-3 items-start px-3 pt-2 pb-2 gap-1">
          {/* Left: address + customer name */}
          <div className="text-[10px] leading-snug text-gray-600">
            <p>5th navyug hill road,</p>
            <p>S/77 Ingalal mansion,</p>
            <p>sandhurst road, Mumbai.</p>
            {invoice.customerPhone && (
              <p className="text-[10px] text-gray-500">{invoice.customerPhone}</p>
            )}
          </div>

          {/* Center: invoice number + date */}
          <div className="text-center">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-0.5">
              Order and Estimate
            </p>
            <p className="text-[11px] font-bold text-gray-700 tracking-wide">
              {invoice.invoiceNumber}
            </p>
            <p className="text-lg font-bold text-gray-800 leading-tight">
              {formatDate(new Date(invoice._creationTime).toISOString())}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              DATE:&nbsp;
              <span className="underline">{formatDate(new Date(invoice._creationTime).toISOString())}</span>
            </p>
          </div>

          {/* Right: brand */}
          <div className="text-right">
            <p className="text-3xl font-extrabold tracking-tight text-gray-800 leading-none">
              TOPS STYLE
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              GST NO.&nbsp;27ACIPU7969C1Z2
            </p>
          </div>
        </div>

        {/* ── CUSTOMER NAME ROW ── */}
        {invoice.customerName && (
          <div className="border-b border-gray-400 py-2 px-3 text-center text-[18px] font-bold text-gray-900 uppercase tracking-widest">
            {invoice.customerName}
          </div>
        )}

        {/* ── ITEMS TABLE ── */}
        <table className="w-full border-collapse text-[12px] flex-1">
          <thead>
            <tr className="border-b border-gray-400 bg-[#f5f0d8]">
              <th className="border-r border-gray-300 py-1.5 px-2 text-center font-bold w-16">BOX</th>
              <th className="border-r border-gray-300 py-1.5 px-2 text-center font-bold w-24">ITEM NO</th>
              <th className="border-r border-gray-300 py-1.5 px-2 text-center font-bold w-16">QTY</th>
              <th className="border-r border-gray-300 py-1.5 px-2 text-center font-bold w-20">RATE</th>
              <th className="py-1.5 px-2 text-center font-bold w-24">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="border-r border-gray-200 py-1 px-2 text-center">{item.box}</td>
                <td className="border-r border-gray-200 py-1 px-2 text-center font-mono font-semibold">{item.productCode}</td>
                <td className="border-r border-gray-200 py-1 px-2 text-center">{item.quantity}</td>
                <td className="border-r border-gray-200 py-1 px-2 text-right">{item.price.toLocaleString("en-IN")}</td>
                <td className="py-1 px-2 text-right font-medium">{formatCurrency(item.total)}</td>
              </tr>
            ))}
            {/* blank filler rows — pad to 14 rows minimum */}
            {Array.from({ length: Math.max(0, 14 - items.length) }).map((_, i) => (
              <tr key={`blank-${i}`} className="border-b border-gray-100">
                <td className="border-r border-gray-100 py-1 px-2">&nbsp;</td>
                <td className="border-r border-gray-100 py-1 px-2">&nbsp;</td>
                <td className="border-r border-gray-100 py-1 px-2">&nbsp;</td>
                <td className="border-r border-gray-100 py-1 px-2">&nbsp;</td>
                <td className="py-1 px-2">&nbsp;</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ── FOOTER ── */}
        <div className="border-t-2 border-gray-400 flex items-center justify-between px-3 py-2">
          <p className="font-bold text-[13px]">{totalBoxes}&nbsp;Boxes</p>
          <p className="text-[11px] font-semibold tracking-wide text-gray-600">
            *PAYMENT TERMS 10 DAYS
          </p>
          <p className="font-bold text-[14px]">
            ₹&nbsp;{invoice.grandTotal.toLocaleString("en-IN")}
          </p>
        </div>

        {/* notes row if any */}
        {invoice.notes && (
          <div className="border-t border-gray-200 px-3 py-1.5 text-[11px] text-gray-600 italic">
            {invoice.notes}
          </div>
        )}
      </div>
    </div>
  );
}
