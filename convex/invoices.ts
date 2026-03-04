import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("invoices").order("desc").collect();
  },
});

export const getById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("invoices").collect();
    return all.length;
  },
});

// ── Mutations ──

const invoiceItemValidator = v.object({
  id: v.string(),
  productCode: v.string(),
  box: v.number(),
  quantity: v.number(),
  price: v.number(),
  total: v.number(),
});

export const add = mutation({
  args: {
    customerName: v.string(),
    customerPhone: v.string(),
    items: v.array(invoiceItemValidator),
    subtotal: v.number(),
    discount: v.number(),
    discountType: v.union(v.literal("flat"), v.literal("percent")),
    grandTotal: v.number(),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    // Generate invoice number based on current count
    const all = await ctx.db.query("invoices").collect();
    const invoiceNumber = `TS-${String(all.length + 1).padStart(4, "0")}`;

    const id = await ctx.db.insert("invoices", {
      ...args,
      invoiceNumber,
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
