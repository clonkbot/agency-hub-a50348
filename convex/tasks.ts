import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("modelTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByModel = query({
  args: { modelName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const tasks = await ctx.db
      .query("modelTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return tasks.filter((t) => t.modelName === args.modelName);
  },
});

export const getTaskStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const tasks = await ctx.db
      .query("modelTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const models = await ctx.db
      .query("models")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === "completed").length;
    const pendingTasks = tasks.filter((t) => t.status === "pending").length;
    const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;

    // Group by model
    const tasksByModel = models.map((model) => {
      const modelTasks = tasks.filter((t) => t.modelName === model.name);
      return {
        modelName: model.name,
        total: modelTasks.length,
        completed: modelTasks.filter((t) => t.status === "completed").length,
        pending: modelTasks.filter((t) => t.status === "pending").length,
        inProgress: modelTasks.filter((t) => t.status === "in_progress").length,
        completionRate:
          modelTasks.length > 0
            ? Math.round(
                (modelTasks.filter((t) => t.status === "completed").length / modelTasks.length) * 100
              )
            : 0,
      };
    });

    // Group by category
    const tasksByCategory = ["content", "engagement", "promo", "admin"].map((category) => {
      const categoryTasks = tasks.filter((t) => t.category === category);
      return {
        category,
        total: categoryTasks.length,
        completed: categoryTasks.filter((t) => t.status === "completed").length,
      };
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      tasksByModel,
      tasksByCategory,
      tasks: tasks.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      }),
    };
  },
});

export const add = mutation({
  args: {
    modelName: v.string(),
    taskTitle: v.string(),
    priority: v.string(),
    category: v.string(),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("modelTasks", {
      userId,
      modelName: args.modelName,
      taskTitle: args.taskTitle,
      status: "pending",
      priority: args.priority,
      category: args.category,
      dueDate: args.dueDate,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("modelTasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      completedDate: args.status === "completed" ? Date.now() : undefined,
    });
  },
});

export const remove = mutation({
  args: { id: v.id("modelTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
