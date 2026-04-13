import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    specialty: v.string(),
    hospital: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      userId,
      name: args.name,
      email: args.email,
      specialty: args.specialty,
      hospital: args.hospital,
      licenseNumber: args.licenseNumber,
      isVerified: false,
      streak: 0,
      papersRead: 0,
      quizAccuracy: 0,
      rank: 0,
      totalPoints: 0,
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    });
  },
});

export const updateLocation = mutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      latitude: args.latitude,
      longitude: args.longitude,
      lastActiveAt: Date.now(),
    });

    // Update or create global learner entry
    const existingLearner = await ctx.db
      .query("globalLearners")
      .filter((q) => q.eq(q.field("profileId"), profile._id))
      .first();

    if (existingLearner) {
      await ctx.db.patch(existingLearner._id, {
        latitude: args.latitude,
        longitude: args.longitude,
        isOnline: true,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("globalLearners", {
        profileId: profile._id,
        latitude: args.latitude,
        longitude: args.longitude,
        specialty: profile.specialty,
        papersThisWeek: profile.papersRead,
        currentStreak: profile.streak,
        isOnline: true,
        lastSeen: Date.now(),
      });
    }
  },
});

export const updateStats = mutation({
  args: {
    papersRead: v.optional(v.number()),
    quizAccuracy: v.optional(v.number()),
    streak: v.optional(v.number()),
    totalPoints: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    await ctx.db.patch(profile._id, {
      ...args,
      lastActiveAt: Date.now(),
    });
  },
});

export const getLeaderboard = query({
  args: { specialty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let profiles;
    if (args.specialty) {
      profiles = await ctx.db
        .query("profiles")
        .withIndex("by_specialty", (q) => q.eq("specialty", args.specialty!))
        .collect();
    } else {
      profiles = await ctx.db.query("profiles").collect();
    }
    return profiles
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 50);
  },
});
