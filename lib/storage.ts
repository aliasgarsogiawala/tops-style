import { Product, Invoice } from "./types";

const PRODUCTS_KEY = "tops_products";
const INVOICES_KEY = "tops_invoices";

export function getProducts(): Product[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PRODUCTS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveProducts(products: Product[]): void {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id" | "createdAt">): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(id: string, updates: Partial<Product>): void {
  const products = getProducts().map((p) =>
    p.id === id ? { ...p, ...updates } : p
  );
  saveProducts(products);
}

export function deleteProduct(id: string): void {
  saveProducts(getProducts().filter((p) => p.id !== id));
}

export function getProductByCode(code: string): Product | undefined {
  return getProducts().find(
    (p) => p.code.toLowerCase() === code.toLowerCase()
  );
}

export function getInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(INVOICES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveInvoices(invoices: Invoice[]): void {
  localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
}

export function addInvoice(invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">): Invoice {
  const invoices = getInvoices();
  const invoiceNumber = `TS-${String(invoices.length + 1).padStart(4, "0")}`;
  const newInvoice: Invoice = {
    ...invoice,
    id: crypto.randomUUID(),
    invoiceNumber,
    createdAt: new Date().toISOString(),
  };
  invoices.push(newInvoice);
  saveInvoices(invoices);
  return newInvoice;
}

export function deleteInvoice(id: string): void {
  saveInvoices(getInvoices().filter((inv) => inv.id !== id));
}
