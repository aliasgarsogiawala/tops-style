"use client";

import { useEffect, useState } from "react";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/storage";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Check,
  Package,
} from "lucide-react";

const CATEGORIES = [
  "Ring",
  "Necklace",
  "Earring",
  "Bracelet",
  "Bangle",
  "Chain",
  "Pendant",
  "Mangalsutra",
  "Other",
];

interface FormState {
  code: string;
  name: string;
  price: string;
  category: string;
}

const emptyForm: FormState = { code: "", name: "", price: "", category: "Other" };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = () => setProducts(getProducts());
  useEffect(() => load(), []);

  const filtered = products.filter(
    (p) =>
      p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  function openNew() {
    setForm(emptyForm);
    setEditId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setForm({ code: p.code, name: p.name, price: String(p.price), category: p.category });
    setEditId(p.id);
    setError("");
    setShowForm(true);
  }

  function handleSave() {
    if (!form.code.trim()) { setError("Product code is required"); return; }
    if (!form.name.trim()) { setError("Product name is required"); return; }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) { setError("Enter a valid price"); return; }

    // Check duplicate code
    const existing = products.find(
      (p) => p.code.toLowerCase() === form.code.trim().toLowerCase() && p.id !== editId
    );
    if (existing) { setError("Product code already exists"); return; }

    if (editId) {
      updateProduct(editId, { code: form.code.trim().toUpperCase(), name: form.name.trim(), price, category: form.category });
    } else {
      addProduct({ code: form.code.trim().toUpperCase(), name: form.name.trim(), price, category: form.category });
    }
    load();
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
  }

  function handleDelete(id: string) {
    deleteProduct(id);
    load();
    setDeleteConfirm(null);
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-amber-900">Products</h2>
          <p className="text-amber-700 mt-1">{products.length} product(s) in catalogue</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-800 text-amber-50 px-5 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
        <input
          type="text"
          placeholder="Search by code, name or category..."
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
            <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="font-semibold text-lg">No products found</p>
            <p className="text-sm mt-1">
              {search ? "Try a different search term" : "Click 'Add Product' to get started"}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-amber-50 border-b border-amber-100">
              <tr>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Code</th>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Name</th>
                <th className="text-left p-4 text-amber-700 font-semibold text-sm">Category</th>
                <th className="text-right p-4 text-amber-700 font-semibold text-sm">Price</th>
                <th className="text-right p-4 text-amber-700 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-amber-50 transition-colors">
                  <td className="p-4">
                    <span className="bg-amber-100 text-amber-800 font-mono font-semibold text-sm px-2.5 py-1 rounded-lg">
                      {p.code}
                    </span>
                  </td>
                  <td className="p-4 text-amber-900 font-medium">{p.name}</td>
                  <td className="p-4 text-amber-600 text-sm">{p.category}</td>
                  <td className="p-4 text-right font-semibold text-amber-800">
                    {formatCurrency(p.price)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-amber-500 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-amber-100">
              <h3 className="text-xl font-bold text-amber-900">
                {editId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-amber-400 hover:text-amber-700 transition-colors"
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
                <label className="block text-sm font-medium text-amber-800 mb-1.5">
                  Product Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. RG001"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-amber-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gold Ring 22K"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1.5">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900 bg-white"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-amber-800 mb-1.5">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 rounded-xl border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-900"
                />
              </div>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 bg-amber-800 text-amber-50 px-4 py-2.5 rounded-xl hover:bg-amber-700 transition-colors font-medium"
              >
                <Check className="w-4 h-4" />
                {editId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Delete Product?</h3>
            <p className="text-amber-600 text-sm mb-6">
              This action cannot be undone. The product will be permanently removed.
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
