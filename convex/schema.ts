import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  products: defineTable({
    code: v.string(),
    price: v.number(),
  }).index("by_code", ["code"]),

  invoices: defineTable({
    invoiceNumber: v.string(),
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(
      v.object({
        id: v.string(),
        productCode: v.string(),
        box: v.number(),
        quantity: v.number(),
        price: v.number(),
        total: v.number(),
      })
    ),
    subtotal: v.number(),
    discount: v.number(),
    discountType: v.union(v.literal("flat"), v.literal("percent")),
    grandTotal: v.number(),
    notes: v.string(),
  }).index("by_invoiceNumber", ["invoiceNumber"]),
});
