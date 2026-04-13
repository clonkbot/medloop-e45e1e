import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getNodes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("knowledgeNodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const addNode = mutation({
  args: {
    topic: v.string(),
    specialty: v.string(),
    paperId: v.id("papers"),
    connectedTopics: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if node already exists
    const existing = await ctx.db
      .query("knowledgeNodes")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("topic"), args.topic))
      .first();

    if (existing) {
      // Update existing node
      const updatedPapers = existing.papersLinked.includes(args.paperId)
        ? existing.papersLinked
        : [...existing.papersLinked, args.paperId];

      const updatedConnections = [...new Set([...existing.connectedTopics, ...args.connectedTopics])];

      await ctx.db.patch(existing._id, {
        strength: Math.min(existing.strength + 0.1, 1),
        lastReviewed: Date.now(),
        papersLinked: updatedPapers,
        connectedTopics: updatedConnections,
      });

      return existing._id;
    }

    return await ctx.db.insert("knowledgeNodes", {
      userId,
      topic: args.topic,
      specialty: args.specialty,
      strength: 0.3,
      lastReviewed: Date.now(),
      connectedTopics: args.connectedTopics,
      papersLinked: [args.paperId],
    });
  },
});

export const generateNodesFromPaper = mutation({
  args: { paperId: v.id("papers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const paper = await ctx.db.get(args.paperId);
    if (!paper) throw new Error("Paper not found");

    // Generate nodes from key learnings
    const topics = paper.keyLearnings.map((learning, index) => {
      // Extract key terms (simplified)
      const words = learning.split(' ').filter(w => w.length > 4);
      return words.slice(0, 3).join(' ');
    });

    // Also add paper title and specialty as nodes
    const allTopics = [paper.title.split(':')[0], paper.specialty, ...topics].filter(Boolean);

    for (let i = 0; i < allTopics.length; i++) {
      const topic = allTopics[i];
      const connectedTopics = allTopics.filter((_, j) => j !== i).slice(0, 3);

      const existing = await ctx.db
        .query("knowledgeNodes")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("topic"), topic))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          strength: Math.min(existing.strength + 0.15, 1),
          lastReviewed: Date.now(),
          papersLinked: [...new Set([...existing.papersLinked, args.paperId])],
          connectedTopics: [...new Set([...existing.connectedTopics, ...connectedTopics])],
        });
      } else {
        await ctx.db.insert("knowledgeNodes", {
          userId,
          topic,
          specialty: paper.specialty,
          strength: 0.25,
          lastReviewed: Date.now(),
          connectedTopics,
          papersLinked: [args.paperId],
        });
      }
    }
  },
});
