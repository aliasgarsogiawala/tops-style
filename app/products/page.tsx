"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search, X, Check, Package } from "lucide-react";

interface FormState {
  code: string;
  price: string;
}

const emptyForm: FormState = { code: "", price: "" };

export default function ProductsPage() {
  const rawProducts = useQuery(api.products.list);
  const products = (rawProducts ?? []) as Array<{ _id: Id<"products">; code: string; price: number }>;

  const addProduct = useMutation(api.products.add);
  const updateProduct = useMutation(api.products.update);
  const removeProduct = useMutation(api.products.remove);

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<"products"> | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"products"> | null>(null);

  const filtered = products.filter((p) =>
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: { _id: Id<"products">; code: string; price: number }) {
    setForm({ code: p.code, price: String(p.price) });
    setEditId(p._id);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.code.trim()) { setError("Product code is required"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setError("Enter a valid price"); return; }

    const existing = products.find(
      (p) => p.code.toLowerCase() === form.code.trim().toLowerCase() && p._id !== editId
    );
    if (existing) { setError("Product code already exists"); return; }

    if (editId) {
      await updateProduct({ id: editId, code: form.code.trim().toUpperCase(), price });
    } else {
      await addProduct({ code: form.code.trim().toUpperCase(), price });
    }
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: Id<"products">) {
    await removeProduct({ id });
    setDeleteConfirm(null);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-zinc-900">Products</h2>
          <p className="text-zinc-700 mt-1">{products.length} product(s) in catalogue</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search by code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900 placeholder-zinc-300"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-zinc-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-16 text-center text-zinc-400">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No products found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Click 'Add Product' to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left p-4 text-zinc-700 font-semibold text-sm">Code</th>
                <th className="text-right p-4 text-zinc-700 font-semibold text-sm">Unit Price</th>
                <th className="text-right p-4 text-zinc-700 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-zinc-50 transition-colors">
                  <td className="p-4">
                    <span className="bg-zinc-100 text-zinc-900 font-mono font-semibold text-sm px-2.5 py-1 rounded-lg">
                      {p.code}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold text-zinc-900">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p._id)}
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

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-zinc-100">
              <h3 className="text-xl font-bold text-zinc-900">
                {editId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. RG001"
                  autoFocus
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 font-mono text-zinc-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                  Unit Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  onKeyDown={(e) => e.key === "Enter" && handleSave()}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 text-zinc-900"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl hover:bg-zinc-700 transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                {editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-2">Delete Product?</h3>
            <p className="text-zinc-600 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors font-medium"
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
