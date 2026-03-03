"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProductByCode, getProducts, addInvoice } from "@/lib/storage";
import { formatCurrency } from "@/lib/utils";
import { Product, InvoiceItem } from "@/lib/types";
import { Plus, Search, ArrowRight, CheckCircle, X, Gem } from "lucide-react";

export default function NewInvoicePage() {
  const router = useRouter();
  const codeInputRef = useRef<HTMLInputElement>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");

  const [codeInput, setCodeInput] = useState("");
  const [qtyInput, setQtyInput] = useState("1");
  const [codeError, setCodeError] = useState("");
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState("0");
  const [discountType, setDiscountType] = useState<"flat" | "percent">("flat");

  const [saved, setSaved] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);

  useEffect(() => {
    setAllProducts(getProducts());
    codeInputRef.current?.focus();
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
      const sugg = allProducts
        .filter((p) => p.code.startsWith(val))
        .slice(0, 5);
      setSuggestions(sugg);
    }
  }, [codeInput, allProducts]);

  function addItem(product?: Product) {
    const p = product || foundProduct;
    if (!p) {
      setCodeError("Product code not found");
      return;
    }
    const qty = parseInt(qtyInput) || 1;
    const existing = items.find((i) => i.productCode === p.code);
    if (existing) {
      setItems(items.map((i) =>
        i.productCode === p.code
          ? { ...i, quantity: i.quantity + qty, total: (i.quantity + qty) * i.price }
          : i
      ));
    } else {
      const newItem: InvoiceItem = {
        id: crypto.randomUUID(),
        productCode: p.code,
        quantity: qty,
        price: p.price,
        total: qty * p.price,
      };
      setItems([...items, newItem]);
    }
    setCodeInput("");
    setQtyInput("1");
    setFoundProduct(null);
    setSuggestions([]);
    setCodeError("");
    codeInputRef.current?.focus();
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id));
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return;
    setItems(items.map((i) =>
      i.id === id ? { ...i, quantity: qty, total: qty * i.price } : i
    ));
  }

  function updatePrice(id: string, price: number) {
    if (price < 0) return;
    setItems(items.map((i) =>
      i.id === id ? { ...i, price, total: i.quantity * price } : i
    ));
  }

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const discountAmt =
    discountType === "percent"
      ? (subtotal * parseFloat(discount || "0")) / 100
      : parseFloat(discount || "0");
  const grandTotal = Math.max(0, subtotal - discountAmt);

  function handleSave() {
    if (items.length === 0) return;
    const inv = addInvoice({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items,
      subtotal,
      discount: parseFloat(discount || "0"),
      discountType,
      grandTotal,
      notes: notes.trim(),
    });
    setSaved(true);
    setTimeout(() => router.push(`/invoices/${inv.id}`), 1200);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-amber-900">New Invoice</h2>
        <p className="text-amber-700 mt-1">Enter product codes to build the bill</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-900 mb-4 text-lg">Customer Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1.5">Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-300"
                />
              </div>
            </div>
          </div>

          {/* Code Entry */}
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5">
            <h3 className="font-semibold text-amber-900 mb-4 text-lg">Add Items by Code</h3>
            <div className="relative">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                  <input
                    ref={codeInputRef}
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addItem(); }}
                    placeholder="Enter product code..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-amber-900 placeholder-amber-300 uppercase"
                  />
                </div>
                <input
                  type="number"
                  value={qtyInput}
                  onChange={(e) => setQtyInput(e.target.value)}
                  min={1}
                  className="w-20 px-3 py-3 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-center"
                  title="Quantity"
                />
                <button
                  onClick={() => addItem()}
                  disabled={!foundProduct}
                  className="px-5 py-3 bg-amber-800 text-amber-50 rounded-xl hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Product found preview */}
              {foundProduct && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <span className="font-mono font-semibold text-green-800 text-sm bg-green-100 px-2 py-0.5 rounded">
                    {foundProduct.code}
                  </span>
                  <span className="font-bold text-green-800">{formatCurrency(foundProduct.price)}</span>
                </div>
              )}

              {/* Suggestions dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-xl shadow-lg overflow-hidden">
                  {suggestions.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setCodeInput(s.code); setSuggestions([]); }}
                      className="w-full text-left px-4 py-3 hover:bg-amber-50 flex items-center justify-between border-b border-amber-50 last:border-0 transition-colors"
                    >
                      <span className="font-mono font-semibold text-amber-800 text-sm bg-amber-100 px-2 py-0.5 rounded">
                        {s.code}
                      </span>
                      <span className="font-semibold text-amber-700">{formatCurrency(s.price)}</span>
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
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="p-4 border-b border-amber-100">
              <h3 className="font-semibold text-amber-900 text-lg">
                Bill Items
                {items.length > 0 && (
                  <span className="ml-2 bg-amber-100 text-amber-700 text-sm font-medium px-2 py-0.5 rounded-full">
                    {items.length}
                  </span>
                )}
              </h3>
            </div>

            {items.length === 0 ? (
              <div className="p-12 text-center">
                <Gem className="w-12 h-12 mx-auto mb-3 text-amber-200" />
                <p className="font-medium text-amber-400">No items added yet</p>
                <p className="text-sm mt-1 text-amber-300">Enter a product code above and press Enter</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-amber-50 text-amber-700 text-sm">
                  <tr>
                    <th className="text-left p-3 font-semibold">Code</th>
                    <th className="text-center p-3 font-semibold w-24">Qty</th>
                    <th className="text-right p-3 font-semibold w-32">Unit Price</th>
                    <th className="text-right p-3 font-semibold w-32">Total</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-50">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50 transition-colors">
                      <td className="p-3">
                        <span className="font-mono text-sm bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                          {item.productCode}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQty(item.id, parseInt(e.target.value) || 1)}
                          min={1}
                          className="w-16 text-center px-2 py-1 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                        />
                      </td>
                      <td className="p-3 text-right">
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updatePrice(item.id, parseFloat(e.target.value) || 0)}
                          min={0}
                          step={0.01}
                          className="w-28 text-right px-2 py-1 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                        />
                      </td>
                      <td className="p-3 text-right font-semibold text-amber-800 text-sm">
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
              </table>
            )}
          </div>
        </div>

        {/* Right column - Summary */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-5 sticky top-8">
            <h3 className="font-semibold text-amber-900 text-lg mb-4">Bill Summary</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-amber-700">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              <div>
                <label className="block text-amber-700 mb-1.5">Discount</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    min={0}
                    step={0.01}
                    className="flex-1 px-3 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 text-sm"
                  />
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as "flat" | "percent")}
                    className="px-2 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-800 bg-white text-sm"
                  >
                    <option value="flat">₹ Flat</option>
                    <option value="percent">% Off</option>
                  </select>
                </div>
              </div>

              {discountAmt > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount Applied</span>
                  <span className="font-medium">- {formatCurrency(discountAmt)}</span>
                </div>
              )}

              <div className="border-t border-amber-100 pt-3 flex justify-between font-bold text-amber-900 text-base">
                <span>Grand Total</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-amber-800 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 placeholder-amber-300 text-sm resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={items.length === 0 || saved}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-amber-800 text-amber-50 py-3 rounded-xl hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
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
