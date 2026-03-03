export interface Product {
  id: string;
  code: string;
  price: number;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productCode: string;
  quantity: number;
  price: number;
  total: number;
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
