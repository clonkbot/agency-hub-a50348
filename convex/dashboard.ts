import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get financial overview with time period filter
export const getFinancialOverview = query({
  args: { period: v.string() }, // "day", "month", "year"
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const now = Date.now();
    let startDate: number;

    switch (args.period) {
      case "day":
        startDate = now - 24 * 60 * 60 * 1000;
        break;
      case "month":
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case "year":
        startDate = now - 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000;
    }

    const revenue = await ctx.db
      .query("revenue")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const costs = await ctx.db
      .query("costs")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const filteredRevenue = revenue.filter((r) => r.date >= startDate);
    const filteredCosts = costs.filter((c) => c.date >= startDate);

    const totalRevenue = filteredRevenue.reduce((sum, r) => sum + r.amount, 0);
    const totalCosts = filteredCosts.reduce((sum, c) => sum + c.amount, 0);
    const profit = totalRevenue - totalCosts;

    // Group by day for chart data
    const chartData: { date: string; revenue: number; costs: number; profit: number }[] = [];
    const dayMap = new Map<string, { revenue: number; costs: number }>();

    filteredRevenue.forEach((r) => {
      const dateKey = new Date(r.date).toLocaleDateString();
      const existing = dayMap.get(dateKey) || { revenue: 0, costs: 0 };
      existing.revenue += r.amount;
      dayMap.set(dateKey, existing);
    });

    filteredCosts.forEach((c) => {
      const dateKey = new Date(c.date).toLocaleDateString();
      const existing = dayMap.get(dateKey) || { revenue: 0, costs: 0 };
      existing.costs += c.amount;
      dayMap.set(dateKey, existing);
    });

    dayMap.forEach((value, key) => {
      chartData.push({
        date: key,
        revenue: value.revenue,
        costs: value.costs,
        profit: value.revenue - value.costs,
      });
    });

    chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalRevenue,
      totalCosts,
      profit,
      profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0,
      chartData,
      revenueBySource: filteredRevenue.reduce((acc, r) => {
        acc[r.source] = (acc[r.source] || 0) + r.amount;
        return acc;
      }, {} as Record<string, number>),
      costsByCategory: filteredCosts.reduce((acc, c) => {
        acc[c.category] = (acc[c.category] || 0) + c.amount;
        return acc;
      }, {} as Record<string, number>),
    };
  },
});

// Get models overview
export const getModels = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("models")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Add revenue entry
export const addRevenue = mutation({
  args: {
    amount: v.number(),
    source: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("revenue", {
      userId,
      amount: args.amount,
      source: args.source,
      date: args.date,
      description: args.description,
    });
  },
});

// Add cost entry
export const addCost = mutation({
  args: {
    amount: v.number(),
    category: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("costs", {
      userId,
      amount: args.amount,
      category: args.category,
      date: args.date,
      description: args.description,
    });
  },
});

// Add model
export const addModel = mutation({
  args: {
    name: v.string(),
    platform: v.string(),
    monthlyRevenue: v.number(),
    subscriberCount: v.number(),
    niche: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("models", {
      userId,
      name: args.name,
      platform: args.platform,
      monthlyRevenue: args.monthlyRevenue,
      subscriberCount: args.subscriberCount,
      niche: args.niche,
      status: args.status,
      joinDate: Date.now(),
    });
  },
});

// Seed demo data
export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already has data
    const existingRevenue = await ctx.db
      .query("revenue")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingRevenue) return { message: "Data already exists" };

    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    // Add sample models
    const modelNames = ["Sophia Belle", "Luna Star", "Maya Rose", "Aria Moon", "Zoe Diamond"];
    const niches = ["Fitness", "Lifestyle", "Glamour", "Art", "Fashion"];

    for (let i = 0; i < modelNames.length; i++) {
      await ctx.db.insert("models", {
        userId,
        name: modelNames[i],
        platform: "OnlyFans",
        monthlyRevenue: Math.floor(Math.random() * 50000) + 10000,
        subscriberCount: Math.floor(Math.random() * 5000) + 500,
        niche: niches[i],
        status: "active",
        joinDate: now - Math.floor(Math.random() * 180) * day,
      });
    }

    // Add revenue entries for past 30 days
    for (let i = 0; i < 30; i++) {
      const date = now - i * day;
      for (const model of modelNames) {
        await ctx.db.insert("revenue", {
          userId,
          amount: Math.floor(Math.random() * 2000) + 500,
          source: model,
          date,
          description: "Daily earnings",
        });
      }
    }

    // Add cost entries
    const costCategories = ["Advertising", "Software", "Equipment", "Payroll", "Marketing"];
    for (let i = 0; i < 30; i++) {
      const date = now - i * day;
      await ctx.db.insert("costs", {
        userId,
        amount: Math.floor(Math.random() * 500) + 100,
        category: costCategories[Math.floor(Math.random() * costCategories.length)],
        date,
        description: "Operating expense",
      });
    }

    // Add employees
    const employeeNames = ["Alex Rivera", "Jordan Chen", "Sam Williams", "Casey Taylor", "Morgan Davis"];
    const roles = ["Account Manager", "Content Strategist", "Marketing Lead", "Chat Manager", "Creative Director"];

    for (let i = 0; i < employeeNames.length; i++) {
      await ctx.db.insert("employees", {
        userId,
        name: employeeNames[i],
        role: roles[i],
        hireDate: now - Math.floor(Math.random() * 365) * day,
        performanceScore: Math.floor(Math.random() * 30) + 70,
        tasksCompleted: Math.floor(Math.random() * 200) + 50,
        revenueGenerated: Math.floor(Math.random() * 100000) + 20000,
        modelsManaged: [modelNames[i]],
      });
    }

    // Add model tasks
    const taskTitles = [
      "Create weekly content calendar",
      "Respond to DMs",
      "Schedule posts",
      "Engagement boost campaign",
      "Photo editing batch",
      "Video content creation",
      "Fan appreciation messages",
      "PPV content prep",
    ];
    const statuses = ["pending", "in_progress", "completed"];
    const priorities = ["low", "medium", "high"];
    const categories = ["content", "engagement", "promo", "admin"];

    for (const model of modelNames) {
      for (let i = 0; i < 8; i++) {
        await ctx.db.insert("modelTasks", {
          userId,
          modelName: model,
          taskTitle: taskTitles[i],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          category: categories[Math.floor(Math.random() * categories.length)],
          dueDate: now + Math.floor(Math.random() * 14) * day,
        });
      }
    }

    // Add trends
    const trendHooks = [
      "POV: You just subscribed...",
      "Tell me why guys always...",
      "The way I...",
      "When he asks for content at 3am...",
      "This is your sign to...",
    ];
    const trendSounds = [
      "Original Sound - Viral Mix",
      "Get Ready With Me Beat",
      "Seductive Lo-Fi",
      "Confidence Anthem",
      "Late Night Vibes",
    ];
    const platforms = ["tiktok", "instagram", "twitter"];

    for (let i = 0; i < 5; i++) {
      await ctx.db.insert("trends", {
        userId,
        type: "hook",
        title: trendHooks[i],
        engagement: Math.floor(Math.random() * 100) + 50,
        platform: platforms[Math.floor(Math.random() * platforms.length)],
        createdAt: now,
        isHot: Math.random() > 0.5,
      });

      await ctx.db.insert("trends", {
        userId,
        type: "sound",
        title: trendSounds[i],
        engagement: Math.floor(Math.random() * 100) + 50,
        platform: "tiktok",
        createdAt: now,
        isHot: Math.random() > 0.5,
      });
    }

    return { message: "Demo data created successfully" };
  },
});
