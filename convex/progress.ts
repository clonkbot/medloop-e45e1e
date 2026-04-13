import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const startPaper = mutation({
  args: { paperId: v.id("papers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("paperProgress")
      .withIndex("by_user_paper", (q) => q.eq("userId", userId).eq("paperId", args.paperId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("paperProgress", {
      userId,
      paperId: args.paperId,
      progress: 0,
      completed: false,
      startedAt: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    paperId: v.id("papers"),
    progress: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("paperProgress")
      .withIndex("by_user_paper", (q) => q.eq("userId", userId).eq("paperId", args.paperId))
      .first();

    if (!existing) throw new Error("Progress not found");

    await ctx.db.patch(existing._id, {
      progress: args.progress,
      completed: args.progress >= 100,
      completedAt: args.progress >= 100 ? Date.now() : undefined,
    });

    // Update user stats if completed
    if (args.progress >= 100) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (profile) {
        await ctx.db.patch(profile._id, {
          papersRead: profile.papersRead + 1,
          totalPoints: profile.totalPoints + 100,
          lastActiveAt: Date.now(),
        });
      }
    }
  },
});

export const submitQuiz = mutation({
  args: {
    paperId: v.id("papers"),
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("paperProgress")
      .withIndex("by_user_paper", (q) => q.eq("userId", userId).eq("paperId", args.paperId))
      .first();

    if (!existing) throw new Error("Progress not found");

    await ctx.db.patch(existing._id, {
      quizScore: args.score,
    });

    // Update accuracy and points
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (profile) {
      const allProgress = await ctx.db
        .query("paperProgress")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      const completedWithQuiz = allProgress.filter(p => p.quizScore !== undefined);
      const avgAccuracy = completedWithQuiz.length > 0
        ? completedWithQuiz.reduce((sum, p) => sum + (p.quizScore || 0), 0) / completedWithQuiz.length
        : 0;

      const bonusPoints = Math.floor(args.score * 0.5);

      await ctx.db.patch(profile._id, {
        quizAccuracy: Math.round(avgAccuracy),
        totalPoints: profile.totalPoints + bonusPoints,
        lastActiveAt: Date.now(),
      });
    }
  },
});

export const getUserProgress = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("paperProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});
