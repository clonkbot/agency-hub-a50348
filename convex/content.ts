import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getByModel = query({
  args: { modelName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const content = await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return content
      .filter((c) => c.modelName === args.modelName)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const content = await ctx.db
      .query("generatedContent")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return content.filter((c) => c.isFavorite).sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const generate = mutation({
  args: {
    modelName: v.string(),
    type: v.string(),
    niche: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate content based on type
    const templates = {
      idea: [
        "Behind-the-scenes morning routine showcase",
        "Interactive Q&A session with subscriber rewards",
        "Exclusive photoshoot sneak peek",
        "Day in the life vlog content",
        "Subscriber appreciation special",
        "Themed content series launch",
        "Collaboration teaser content",
        "Milestone celebration exclusive",
      ],
      script: [
        "Hey babe! I've been thinking about you all day... wanted to share something special just for you. You've been such an amazing supporter 💕",
        "Good morning sunshine ☀️ Starting my day with you on my mind. What should we do together today?",
        "Can't believe we hit this milestone together! You deserve something extra special... check your DMs 😘",
        "POV: You just subscribed and I'm about to show you why that was the best decision you made today...",
        "I have a confession to make... I've been saving something special just for my top supporters like you 💋",
      ],
      caption: [
        "New week, new content 🔥 Link in bio for the full experience",
        "They told me I couldn't... so I did it anyway 💅",
        "Your support means everything 💕 Check your messages",
        "Something special dropping tonight... who's ready? 🌙",
        "Living my best life and taking you along for the ride ✨",
      ],
      hook: [
        "POV: You just found your new favorite creator...",
        "Wait until you see what I have planned for this week",
        "The way I've been working on this for you 👀",
        "Let me show you why my subscribers never leave...",
        "This is your sign to treat yourself today 💫",
      ],
    };

    const typeTemplates = templates[args.type as keyof typeof templates] || templates.idea;
    const content = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];

    return await ctx.db.insert("generatedContent", {
      userId,
      modelName: args.modelName,
      type: args.type,
      content,
      niche: args.niche,
      createdAt: Date.now(),
      isFavorite: false,
    });
  },
});

export const toggleFavorite = mutation({
  args: { id: v.id("generatedContent") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const content = await ctx.db.get(args.id);
    if (!content || content.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isFavorite: !content.isFavorite });
  },
});

export const remove = mutation({
  args: { id: v.id("generatedContent") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const content = await ctx.db.get(args.id);
    if (!content || content.userId !== userId) throw new Error("Not found");

    await ctx.db.delete(args.id);
  },
});
