import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("trends")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByType = query({
  args: { type: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const trends = await ctx.db
      .query("trends")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return trends
      .filter((t) => t.type === args.type)
      .sort((a, b) => b.engagement - a.engagement);
  },
});

export const getTrendStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const trends = await ctx.db
      .query("trends")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const hooks = trends.filter((t) => t.type === "hook");
    const sounds = trends.filter((t) => t.type === "sound");
    const hotTrends = trends.filter((t) => t.isHot);

    return {
      totalTrends: trends.length,
      hotTrends: hotTrends.length,
      hooks: hooks.sort((a, b) => b.engagement - a.engagement),
      sounds: sounds.sort((a, b) => b.engagement - a.engagement),
      byPlatform: {
        tiktok: trends.filter((t) => t.platform === "tiktok").length,
        instagram: trends.filter((t) => t.platform === "instagram").length,
        twitter: trends.filter((t) => t.platform === "twitter").length,
      },
    };
  },
});

export const add = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    engagement: v.number(),
    platform: v.string(),
    isHot: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("trends", {
      userId,
      type: args.type,
      title: args.title,
      description: args.description,
      engagement: args.engagement,
      platform: args.platform,
      createdAt: Date.now(),
      isHot: args.isHot,
    });
  },
});

export const toggleHot = mutation({
  args: { id: v.id("trends") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const trend = await ctx.db.get(args.id);
    if (!trend || trend.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isHot: !trend.isHot });
  },
});

export const remove = mutation({
  args: { id: v.id("trends") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const trend = await ctx.db.get(args.id);
    if (!trend || trend.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
