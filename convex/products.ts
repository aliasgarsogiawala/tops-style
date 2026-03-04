import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Queries ──

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").collect();
  },
});

export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    return await ctx.db
      .query("products")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
  },
});

// ── Mutations ──

export const add = mutation({
  args: { code: v.string(), price: v.number() },
  handler: async (ctx, { code, price }) => {
    const id = await ctx.db.insert("products", {
      code: code.toUpperCase(),
      price,
    });
    return id;
  },
});

export const update = mutation({
  args: { id: v.id("products"), code: v.string(), price: v.number() },
  handler: async (ctx, { id, code, price }) => {
    await ctx.db.patch(id, { code: code.toUpperCase(), price });
  },
});

export const remove = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
