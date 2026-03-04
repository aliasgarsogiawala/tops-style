export interface Product {
  id: string;
  code: string;
  price: number;
  createdAt: string;
}

// Convex document shapes (used for type-casting query results)
export interface ConvexProduct {
  _id: string;
  _creationTime: number;
  code: string;
  price: number;
}

export interface ConvexInvoice {
  _id: string;
  _creationTime: number;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: "flat" | "percent";
  grandTotal: number;
  notes: string;
}

export interface InvoiceItem {
  id: string;
  productCode: string;
  box: number;       // entered by user
  quantity: number;  // box × 12
  price: number;     // unit price (rate)
  total: number;     // qty × price
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  discountType: "flat" | "percent";
  grandTotal: number;
  notes: string;
  createdAt: string;
}
