"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductByCode, getProducts, addInvoice } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { Product, InvoiceItem } from "@/lib/types";
import { Plus, Search, ArrowRight, CheckCircle, X, Gem } from "lucide-react";

const PCS_PER_BOX = 12;

export default function NewInvoicePage() {
  const router = useRouter();
  const boxInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  // entry row state
  const [boxInput, setBoxInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    setAllProducts(getProducts());
    boxInputRef.current?.focus();
  }, []);

  // Live code lookup + suggestions
  useEffect(() => {
    const val = codeInput.trim().toUpperCase();
    if (!val) {
      setFoundProduct(null);
      setCodeError("");
      setSuggestions([]);
      return;
    }
    const exact = getProductByCode(val);
    if (exact) {
      setFoundProduct(exact);
      setCodeError("");
      setSuggestions([]);
    } else {
      setFoundProduct(null);
      setCodeError("");
      setSuggestions(allProducts.filter((p) => p.code.startsWith(val)).slice(0, 5));
    }
  }, [codeInput, allProducts]);

  function addItem(product?: Product) {
    const p = product || foundProduct;
    const box = parseInt(boxInput);
    if (!box || box <= 0) { setCodeError("Enter a valid box number"); return; }
    if (!p) { setCodeError("Product code not found"); return; }

    const qty = box * PCS_PER_BOX;
    const existing = items.find((i) => i.productCode === p.code);
    if (existing) {
      setItems(items.map((i) =>
        i.productCode === p.code
          ? { ...i, box: i.box + box, quantity: (i.box + box) * PCS_PER_BOX, total: (i.box + box) * PCS_PER_BOX * i.price }
          : i
      ));
    } else {
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        productCode: p.code,
        box,
        quantity: qty,
        price: p.price,
        total: qty * p.price,
      };
      setItems((prev) => [...prev, newItem]);
    }
    setBoxInput("");
    setCodeInput("");
    setFoundProduct(null);
    setSuggestions([]);
    setCodeError("");
    boxInputRef.current?.focus();
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  function updateBox(id: string, box: number) {
    if (box <= 0) return;
    const qty = box * PCS_PER_BOX;
    setItems(items.map((i) =>
      i.id === id ? { ...i, box, quantity: qty, total: qty * i.price } : i
    ));
  }

  function updateRate(id: string, price: number) {
    if (price < 0) return;
    setItems(items.map((i) =>
      i.id === id ? { ...i, price, total: i.quantity * price } : i
    ));
  }

  const grossTotal = items.reduce((s, i) => s + i.total, 0);

  function handleSave() {
    if (items.length === 0) return;
    const inv = addInvoice({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      subtotal: grossTotal,
      discount: 0,
      discountType: "flat",
      grandTotal: grossTotal,
      notes: notes.trim(),
    });
    setSaved(true);
    setTimeout(() => router.push(`/invoices/${inv.id}`), 1200);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-900">New Invoice</h2>
        <p className="text-zinc-700 mt-1">Enter box, code — qty auto-fills (box × 12)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer Info */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-5">
            <h3 className="font-semibold text-zinc-900 mb-4 text-lg">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 placeholder-zinc-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 placeholder-zinc-300"
                />
              </div>
            </div>
          </div>

          {/* Entry Row */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-5">
            <h3 className="font-semibold text-zinc-900 mb-4 text-lg">Add Item</h3>
            <div className="relative">
              <div className="flex gap-3 items-end">

                {/* Box */}
                <div className="w-28">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Box</label>
                  <input
                    ref={boxInputRef}
                    type="number"
                    value={boxInput}
                    onChange={(e) => setBoxInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") codeInputRef.current?.focus(); }}
                    placeholder="0"
                    min={1}
                    className="w-full px-3 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 text-center font-semibold"
                  />
                </div>

                {/* Code */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Code</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      ref={codeInputRef}
                      type="text"
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
                      placeholder="Product code..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono text-zinc-900 placeholder-zinc-300 uppercase"
                    />
                  </div>
                </div>

                {/* Qty preview */}
                <div className="w-28">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">
                    Qty <span className="normal-case font-normal text-zinc-400">(box×12)</span>
                  </label>
                  <div className="w-full px-3 py-3 rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-700 text-center font-semibold">
                    {boxInput && parseInt(boxInput) > 0
                      ? parseInt(boxInput) * PCS_PER_BOX
                      : "—"}
                  </div>
                </div>

                {/* Rate preview */}
                <div className="w-32">
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5 uppercase tracking-wide">Rate</label>
                  <div className="w-full px-3 py-3 rounded-xl border border-zinc-100 bg-zinc-50 text-zinc-700 text-right font-semibold">
                    {foundProduct ? formatCurrency(foundProduct.price) : "—"}
                  </div>
                </div>

                {/* Add button */}
                <button
                  onClick={() => addItem()}
                  disabled={!foundProduct || !boxInput}
                  className="px-5 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 left-[calc(7rem+0.75rem)] right-[calc(7rem+8rem+2*0.75rem+5rem)] mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setCodeInput(s.code); setSuggestions([]); codeInputRef.current?.focus(); }}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 flex items-center justify-between border-b border-zinc-50 last:border-0 transition-colors"
                    >
                      <span className="font-mono font-semibold text-zinc-900 text-sm bg-zinc-100 px-2 py-0.5 rounded">
                        {s.code}
                      </span>
                      <span className="font-semibold text-zinc-700 text-sm">{formatCurrency(s.price)}</span>
                    </button>
                  ))}
                </div>
              )}

              {codeError && (
                <p className="mt-2 text-red-500 text-sm">{codeError}</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
            <div className="p-4 border-b border-zinc-100">
              <h3 className="font-semibold text-zinc-900 text-lg">
                Bill Items
                {items.length > 0 && (
                  <span className="ml-2 bg-zinc-100 text-zinc-700 text-sm font-medium px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </h3>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center">
                <Gem className="w-12 h-12 mx-auto mb-3 text-zinc-200" />
                <p className="font-medium text-zinc-400">No items added yet</p>
                <p className="text-sm mt-1 text-zinc-300">Enter box and code above, then press Enter or Add</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-zinc-50 text-zinc-700 text-sm">
                  <tr>
                    <th className="text-left p-3 font-semibold">Code</th>
                    <th className="text-center p-3 font-semibold">Box</th>
                    <th className="text-center p-3 font-semibold">Qty</th>
                    <th className="text-right p-3 font-semibold">Rate</th>
                    <th className="text-right p-3 font-semibold">Amount</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono text-sm bg-zinc-100 text-zinc-900 px-2 py-0.5 rounded font-semibold">
                          {item.productCode}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={item.box}
                          onChange={(e) => updateBox(item.id, parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-16 text-center px-2 py-1 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 text-sm"
                        />
                      </td>
                      <td className="p-3 text-center text-zinc-700 font-medium text-sm">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateRate(item.id, parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.01}
                          className="w-28 text-right px-2 py-1 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 text-sm"
                        />
                      </td>
                      <td className="p-3 text-right font-semibold text-zinc-900 text-sm">
                        {formatCurrency(item.total)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-zinc-50 border-t-2 border-zinc-200">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-bold text-zinc-900">
                      Gross Total
                    </td>
                    <td className="p-3 text-right font-bold text-zinc-900 text-base">
                      {formatCurrency(grossTotal)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>

        {/* Right column - Summary */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-zinc-100 p-5 sticky top-8">
            <h3 className="font-semibold text-zinc-900 text-lg mb-4">Summary</h3>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-zinc-700">
                <span>Total Items</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>Total Boxes</span>
                <span className="font-medium">{items.reduce((s, i) => s + i.box, 0)}</span>
              </div>
              <div className="flex justify-between text-zinc-700">
                <span>Total Qty (pcs)</span>
                <span className="font-medium">{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="border-t border-zinc-100 pt-2 flex justify-between font-bold text-zinc-900 text-base">
                <span>Gross Total</span>
                <span>{formatCurrency(grossTotal)}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-zinc-900 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 placeholder-zinc-300 text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={items.length === 0 || saved}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 text-white py-3 rounded-xl hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
            >
              {saved ? (
                <><CheckCircle className="w-4 h-4" /> Saved! Redirecting...</>
              ) : (
                <>Save Invoice <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
