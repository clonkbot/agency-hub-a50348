import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getPerformanceStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const employees = await ctx.db
      .query("employees")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (employees.length === 0) return null;

    const totalTasks = employees.reduce((sum, e) => sum + e.tasksCompleted, 0);
    const totalRevenue = employees.reduce((sum, e) => sum + e.revenueGenerated, 0);
    const avgPerformance = employees.reduce((sum, e) => sum + e.performanceScore, 0) / employees.length;

    const topPerformer = employees.reduce((top, e) =>
      e.performanceScore > top.performanceScore ? e : top
    );

    return {
      totalEmployees: employees.length,
      totalTasks,
      totalRevenue,
      avgPerformance: Math.round(avgPerformance),
      topPerformer: topPerformer.name,
      employees: employees.sort((a, b) => b.performanceScore - a.performanceScore),
    };
  },
});

export const add = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("employees", {
      userId,
      name: args.name,
      role: args.role,
      email: args.email,
      hireDate: Date.now(),
      performanceScore: 75,
      tasksCompleted: 0,
      revenueGenerated: 0,
      modelsManaged: [],
    });
  },
});

export const updatePerformance = mutation({
  args: {
    id: v.id("employees"),
    performanceScore: v.number(),
    tasksCompleted: v.number(),
    revenueGenerated: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const employee = await ctx.db.get(args.id);
    if (!employee || employee.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      performanceScore: args.performanceScore,
      tasksCompleted: args.tasksCompleted,
      revenueGenerated: args.revenueGenerated,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("employees") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const employee = await ctx.db.get(args.id);
    if (!employee || employee.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
