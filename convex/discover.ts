import { query } from "./_generated/server";

export const getGlobalLearners = query({
  args: {},
  handler: async (ctx) => {
    const learners = await ctx.db
      .query("globalLearners")
      .collect();

    // Join with profiles to get names
    const learnersWithProfiles = await Promise.all(
      learners.map(async (learner) => {
        const profile = await ctx.db.get(learner.profileId);
        return {
          ...learner,
          name: profile?.name || "Anonymous",
          avatar: profile?.avatarUrl,
        };
      })
    );

    return learnersWithProfiles;
  },
});

export const getOnlineLearners = query({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    const learners = await ctx.db
      .query("globalLearners")
      .withIndex("by_online", (q) => q.eq("isOnline", true))
      .collect();

    return learners.filter(l => l.lastSeen > fiveMinutesAgo);
  },
});
