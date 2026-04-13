import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: { specialty: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.specialty) {
      return await ctx.db
        .query("papers")
        .withIndex("by_specialty", (q) => q.eq("specialty", args.specialty!))
        .order("desc")
        .collect();
    }
    return await ctx.db.query("papers").order("desc").collect();
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("papers")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .first();
  },
});

export const get = query({
  args: { id: v.id("papers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getWithProgress = query({
  args: { id: v.id("papers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const paper = await ctx.db.get(args.id);
    if (!paper) return null;

    let progress = null;
    if (userId) {
      progress = await ctx.db
        .query("paperProgress")
        .withIndex("by_user_paper", (q) => q.eq("userId", userId).eq("paperId", args.id))
        .first();
    }

    const questions = await ctx.db
      .query("quizQuestions")
      .withIndex("by_paper", (q) => q.eq("paperId", args.id))
      .collect();

    return { paper, progress, questions };
  },
});

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("papers").first();
    if (existing) return "Already seeded";

    const specialties = ["Cardiology", "Oncology", "Neurology", "Pharmacology", "Immunology"];
    const papers = [
      {
        title: "Novel SGLT2 Inhibitors in Heart Failure Management",
        authors: ["Dr. Sarah Chen", "Dr. Michael Ross"],
        abstract: "This comprehensive study examines the efficacy of next-generation SGLT2 inhibitors in treating patients with heart failure with preserved ejection fraction (HFpEF). Our findings demonstrate significant improvements in cardiovascular outcomes and quality of life metrics across diverse patient populations.",
        specialty: "Cardiology",
        publishedDate: "2024-01-15",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example1",
        imageUrl: "cardiology",
        readTime: 12,
        difficulty: "Advanced",
        keyLearnings: [
          "SGLT2 inhibitors reduce hospitalization rates by 32% in HFpEF patients",
          "Benefits observed regardless of diabetes status",
          "Optimal dosing protocols for elderly patients established",
          "Combination therapy with ARNIs shows synergistic effects"
        ],
        citations: 234,
        isFeatured: true,
      },
      {
        title: "CAR-T Cell Therapy: Third-Generation Modifications",
        authors: ["Dr. Emily Watson", "Dr. James Park"],
        abstract: "An exploration of third-generation CAR-T cell modifications that enhance persistence and reduce cytokine release syndrome. This breakthrough research presents novel armored CAR constructs with improved safety profiles.",
        specialty: "Oncology",
        publishedDate: "2024-01-12",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example2",
        imageUrl: "oncology",
        readTime: 15,
        difficulty: "Expert",
        keyLearnings: [
          "Third-gen CARs incorporate CD28 and 4-1BB costimulatory domains",
          "IL-15 armoring improves T-cell persistence 3-fold",
          "CRS rates reduced from 42% to 18% with safety switches",
          "Solid tumor efficacy improved with TME modulators"
        ],
        citations: 189,
        isFeatured: false,
      },
      {
        title: "Neuroplasticity Markers in Early Alzheimer's Detection",
        authors: ["Dr. Robert Kim", "Dr. Lisa Thompson"],
        abstract: "This study identifies novel blood-based biomarkers associated with neuroplasticity decline that precede clinical Alzheimer's symptoms by up to 10 years. Early detection enables intervention during the prodromal phase.",
        specialty: "Neurology",
        publishedDate: "2024-01-10",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example3",
        imageUrl: "neurology",
        readTime: 10,
        difficulty: "Intermediate",
        keyLearnings: [
          "BDNF/proBDNF ratio serves as early neuroplasticity marker",
          "Plasma p-tau217 detectable 8-12 years before symptoms",
          "Combined panel achieves 94% sensitivity and 91% specificity",
          "Lifestyle interventions during prodromal phase show promise"
        ],
        citations: 312,
        isFeatured: false,
      },
      {
        title: "GLP-1 Agonists: Beyond Glycemic Control",
        authors: ["Dr. Amanda Foster", "Dr. David Liu"],
        abstract: "Comprehensive analysis of GLP-1 receptor agonists' pleiotropic effects including neuroprotection, cardioprotection, and anti-inflammatory properties. This review synthesizes data from 47 clinical trials.",
        specialty: "Pharmacology",
        publishedDate: "2024-01-08",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example4",
        imageUrl: "pharmacology",
        readTime: 18,
        difficulty: "Advanced",
        keyLearnings: [
          "GLP-1RAs reduce MACE by 14% independent of glucose lowering",
          "Neuroprotective effects observed in Parkinson's trials",
          "Anti-inflammatory action mediated by NF-κB pathway inhibition",
          "Weight loss mechanisms involve central appetite regulation"
        ],
        citations: 456,
        isFeatured: false,
      },
      {
        title: "mRNA Vaccine Platform Innovations for Emerging Pathogens",
        authors: ["Dr. Jennifer Moore", "Dr. Thomas Anderson"],
        abstract: "This paper presents advances in mRNA vaccine technology enabling rapid response to novel pathogens. Thermostable formulations and self-amplifying constructs are evaluated for global deployment readiness.",
        specialty: "Immunology",
        publishedDate: "2024-01-05",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example5",
        imageUrl: "immunology",
        readTime: 14,
        difficulty: "Intermediate",
        keyLearnings: [
          "Thermostable LNPs maintain potency at 25°C for 6 months",
          "Self-amplifying RNA requires 10-fold lower doses",
          "Universal coronavirus spike designs show broad neutralization",
          "Platform enables prototype-to-trial in under 60 days"
        ],
        citations: 278,
        isFeatured: false,
      },
      {
        title: "Atrial Fibrillation Ablation: Pulsed Field Technology",
        authors: ["Dr. Marcus Williams", "Dr. Sophia Lee"],
        abstract: "Evaluation of pulsed field ablation (PFA) as a safer alternative to thermal ablation for atrial fibrillation. Tissue selectivity minimizes collateral damage while maintaining high success rates.",
        specialty: "Cardiology",
        publishedDate: "2024-01-03",
        sourceUrl: "https://pubmed.ncbi.nlm.nih.gov/example6",
        imageUrl: "cardiology",
        readTime: 11,
        difficulty: "Expert",
        keyLearnings: [
          "PFA achieves 94% pulmonary vein isolation at 12 months",
          "Esophageal injury risk reduced from 2.3% to 0.1%",
          "Procedure time reduced by 35% vs. radiofrequency",
          "Phrenic nerve palsy virtually eliminated with tissue selectivity"
        ],
        citations: 167,
        isFeatured: false,
      },
    ];

    for (const paper of papers) {
      const paperId = await ctx.db.insert("papers", {
        ...paper,
        createdAt: Date.now(),
      });

      // Add quiz questions for each paper
      const questions = [
        {
          paperId,
          question: `Based on the key findings, which outcome was most significant in this ${paper.specialty} study?`,
          options: [
            paper.keyLearnings[0],
            "No significant changes were observed",
            "Results were inconclusive across populations",
            "Further research is needed before conclusions"
          ],
          correctIndex: 0,
          explanation: `The study's primary finding was: ${paper.keyLearnings[0]}`,
        },
        {
          paperId,
          question: `What is the recommended clinical application from this research?`,
          options: [
            "Avoid implementation until more data available",
            paper.keyLearnings[1],
            "Limit use to research settings only",
            "Contraindicated in all patient populations"
          ],
          correctIndex: 1,
          explanation: `Clinical applications include: ${paper.keyLearnings[1]}`,
        },
      ];

      for (const q of questions) {
        await ctx.db.insert("quizQuestions", q);
      }
    }

    return "Seeded successfully";
  },
});

export const getUserPapers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const progress = await ctx.db
      .query("paperProgress")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const papersWithProgress = await Promise.all(
      progress.map(async (p) => {
        const paper = await ctx.db.get(p.paperId);
        return { ...paper, progress: p };
      })
    );

    return papersWithProgress.filter(Boolean);
  },
});
