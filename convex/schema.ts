import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Revenue entries for tracking income
  revenue: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    source: v.string(),
    date: v.number(),
    modelId: v.optional(v.string()),
    description: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // Cost/expense entries
  costs: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    category: v.string(),
    date: v.number(),
    description: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_date", ["date"]),

  // Employee performance tracking
  employees: defineTable({
    userId: v.id("users"),
    name: v.string(),
    role: v.string(),
    email: v.optional(v.string()),
    avatar: v.optional(v.string()),
    hireDate: v.number(),
    performanceScore: v.number(),
    tasksCompleted: v.number(),
    revenueGenerated: v.number(),
    modelsManaged: v.array(v.string()),
  }).index("by_user", ["userId"]),

  // Model tasks from Notion connection
  modelTasks: defineTable({
    userId: v.id("users"),
    modelName: v.string(),
    taskTitle: v.string(),
    status: v.string(),
    priority: v.string(),
    dueDate: v.optional(v.number()),
    completedDate: v.optional(v.number()),
    notionId: v.optional(v.string()),
    category: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_model", ["modelName"])
    .index("by_status", ["status"]),

  // Trends tracking
  trends: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    engagement: v.number(),
    platform: v.string(),
    createdAt: v.number(),
    isHot: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // Generated ideas and scripts
  generatedContent: defineTable({
    userId: v.id("users"),
    modelName: v.string(),
    type: v.string(),
    content: v.string(),
    niche: v.optional(v.string()),
    createdAt: v.number(),
    isFavorite: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_model", ["modelName"]),

  // Models managed by the agency
  models: defineTable({
    userId: v.id("users"),
    name: v.string(),
    platform: v.string(),
    avatar: v.optional(v.string()),
    monthlyRevenue: v.number(),
    subscriberCount: v.number(),
    joinDate: v.number(),
    niche: v.string(),
    status: v.string(),
  }).index("by_user", ["userId"]),
});
