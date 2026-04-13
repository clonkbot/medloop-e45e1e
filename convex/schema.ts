import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with doctor verification
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    email: v.string(),
    specialty: v.string(),
    hospital: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    isVerified: v.boolean(),
    avatarUrl: v.optional(v.string()),
    streak: v.number(),
    papersRead: v.number(),
    quizAccuracy: v.number(),
    rank: v.number(),
    totalPoints: v.number(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_specialty", ["specialty"])
    .index("by_rank", ["rank"]),

  // Research papers
  papers: defineTable({
    title: v.string(),
    authors: v.array(v.string()),
    abstract: v.string(),
    specialty: v.string(),
    publishedDate: v.string(),
    sourceUrl: v.string(),
    imageUrl: v.string(),
    readTime: v.number(),
    difficulty: v.string(),
    keyLearnings: v.array(v.string()),
    citations: v.number(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
  }).index("by_specialty", ["specialty"])
    .index("by_featured", ["isFeatured"])
    .index("by_date", ["createdAt"]),

  // User progress on papers
  paperProgress: defineTable({
    userId: v.id("users"),
    paperId: v.id("papers"),
    progress: v.number(),
    completed: v.boolean(),
    quizScore: v.optional(v.number()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_paper", ["paperId"])
    .index("by_user_paper", ["userId", "paperId"]),

  // Quiz questions for papers
  quizQuestions: defineTable({
    paperId: v.id("papers"),
    question: v.string(),
    options: v.array(v.string()),
    correctIndex: v.number(),
    explanation: v.string(),
  }).index("by_paper", ["paperId"]),

  // Knowledge graph nodes
  knowledgeNodes: defineTable({
    userId: v.id("users"),
    topic: v.string(),
    specialty: v.string(),
    strength: v.number(),
    lastReviewed: v.number(),
    connectedTopics: v.array(v.string()),
    papersLinked: v.array(v.id("papers")),
  }).index("by_user", ["userId"])
    .index("by_user_specialty", ["userId", "specialty"]),

  // Global learners for discover globe
  globalLearners: defineTable({
    profileId: v.id("profiles"),
    latitude: v.number(),
    longitude: v.number(),
    specialty: v.string(),
    papersThisWeek: v.number(),
    currentStreak: v.number(),
    isOnline: v.boolean(),
    lastSeen: v.number(),
  }).index("by_online", ["isOnline"]),
});
