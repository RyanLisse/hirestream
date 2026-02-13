import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List applications with optional filtering
export const list = query({
  args: {
    candidateId: v.optional(v.id("candidates")),
    jobId: v.optional(v.id("jobs")),
    stage: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { candidateId, jobId, stage, status, limit = 100 } = args;

    if (candidateId) {
      const results = await ctx.db
        .query("applications")
        .withIndex("by_candidate", (q) => q.eq("candidateId", candidateId))
        .take(limit);

      // Filter by stage if provided
      if (stage) {
        return results.filter(app => app.stage === stage);
      }
      if (status) {
        return results.filter(app => app.status === status);
      }

      return results;
    }

    if (jobId) {
      const results = await ctx.db
        .query("applications")
        .withIndex("by_job", (q) => q.eq("jobId", jobId))
        .take(limit);

      // Filter by stage if provided
      if (stage) {
        return results.filter(app => app.stage === stage);
      }
      if (status) {
        return results.filter(app => app.status === status);
      }

      return results;
    }

    if (stage) {
      const results = await ctx.db
        .query("applications")
        .withIndex("by_stage", (q) => q.eq("stage", stage))
        .take(limit);

      // Filter by status if provided
      if (status) {
        return results.filter(app => app.status === status);
      }

      return results;
    }

    if (status) {
      const results = await ctx.db
        .query("applications")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);

      return results;
    }

    // No filter - return all applications
    const results = await ctx.db.query("applications").take(limit);
    return results;
  },
});

// Get a single application by ID
export const get = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error(`Application ${args.id} not found`);
    }
    return application;
  },
});

// Get application with candidate and job details
export const getWithDetails = query({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error(`Application ${args.id} not found`);
    }

    const candidate = await ctx.db.get(application.candidateId);
    const job = await ctx.db.get(application.jobId);

    return {
      ...application,
      candidate,
      job,
    };
  },
});

// Create a new application
export const create = mutation({
  args: {
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
    status: v.optional(v.string()),
    stage: v.optional(v.string()),
    aiMatchScore: v.optional(v.number()),
    knockOutResults: v.optional(v.any()),
    scoringResults: v.optional(v.any()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify candidate exists
    const candidate = await ctx.db.get(args.candidateId);
    if (!candidate) {
      throw new Error(`Candidate ${args.candidateId} not found`);
    }

    // Verify job exists
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error(`Job ${args.jobId} not found`);
    }

    // Check for duplicate application
    const existing = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();

    const duplicate = existing.find(app => app.jobId === args.jobId);
    if (duplicate) {
      throw new Error(`Application already exists for this candidate and job`);
    }

    // Validate stage
    const validStages = ["new", "screening", "interview", "offer", "hired", "rejected"];
    const stage = args.stage || "new";
    if (!validStages.includes(stage)) {
      throw new Error(`Invalid stage: ${stage}. Must be one of: ${validStages.join(", ")}`);
    }

    // Validate AI match score
    if (args.aiMatchScore !== undefined && (args.aiMatchScore < 0 || args.aiMatchScore > 100)) {
      throw new Error("AI match score must be between 0 and 100");
    }

    const applicationId = await ctx.db.insert("applications", {
      candidateId: args.candidateId,
      jobId: args.jobId,
      status: args.status || "active",
      stage,
      aiMatchScore: args.aiMatchScore,
      knockOutResults: args.knockOutResults,
      scoringResults: args.scoringResults,
      notes: args.notes,
    });

    return applicationId;
  },
});

// Update application stage (for pipeline moves)
export const updateStage = mutation({
  args: {
    id: v.id("applications"),
    stage: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error(`Application ${args.id} not found`);
    }

    const validStages = ["new", "screening", "interview", "offer", "hired", "rejected"];
    if (!validStages.includes(args.stage)) {
      throw new Error(`Invalid stage: ${args.stage}. Must be one of: ${validStages.join(", ")}`);
    }

    const updates: any = { stage: args.stage };
    if (args.notes) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.id, updates);
    return { success: true, id: args.id, stage: args.stage };
  },
});

// Save AI match results
export const saveMatchResults = mutation({
  args: {
    id: v.id("applications"),
    aiMatchScore: v.number(),
    knockOutResults: v.optional(v.any()),
    scoringResults: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error(`Application ${args.id} not found`);
    }

    // Validate AI match score
    if (args.aiMatchScore < 0 || args.aiMatchScore > 100) {
      throw new Error("AI match score must be between 0 and 100");
    }

    await ctx.db.patch(args.id, {
      aiMatchScore: args.aiMatchScore,
      knockOutResults: args.knockOutResults,
      scoringResults: args.scoringResults,
    });

    return { success: true, id: args.id, aiMatchScore: args.aiMatchScore };
  },
});

// Update application
export const update = mutation({
  args: {
    id: v.id("applications"),
    status: v.optional(v.string()),
    stage: v.optional(v.string()),
    aiMatchScore: v.optional(v.number()),
    knockOutResults: v.optional(v.any()),
    scoringResults: v.optional(v.any()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const application = await ctx.db.get(id);
    if (!application) {
      throw new Error(`Application ${id} not found`);
    }

    // Validate stage if provided
    if (updates.stage) {
      const validStages = ["new", "screening", "interview", "offer", "hired", "rejected"];
      if (!validStages.includes(updates.stage)) {
        throw new Error(`Invalid stage: ${updates.stage}. Must be one of: ${validStages.join(", ")}`);
      }
    }

    // Validate AI match score if provided
    if (updates.aiMatchScore !== undefined && (updates.aiMatchScore < 0 || updates.aiMatchScore > 100)) {
      throw new Error("AI match score must be between 0 and 100");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete application
export const remove = mutation({
  args: { id: v.id("applications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error(`Application ${args.id} not found`);
    }

    // Check for related interviews
    const interviews = await ctx.db
      .query("interviews")
      .withIndex("by_application", (q) => q.eq("applicationId", args.id))
      .first();

    if (interviews) {
      throw new Error(`Cannot delete application with scheduled interviews. Cancel interviews first.`);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Find application by candidate and job (used by AI matcher)
export const findByCandidate = query({
  args: {
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.candidateId))
      .collect();

    // Filter for matching job
    return applications.find((app) => app.jobId === args.jobId);
  },
});
