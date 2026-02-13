import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

// List candidates with optional filtering and pagination
export const list = query({
  args: {
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, search, limit = 50 } = args;

    if (search) {
      // Use search index for name-based queries
      const results = await ctx.db
        .query("candidates")
        .withSearchIndex("search_candidates", (q) =>
          status ? q.search("name", search).eq("status", status) : q.search("name", search)
        )
        .take(limit);
      return results;
    }

    if (status) {
      // Use status index for filtered queries
      const results = await ctx.db
        .query("candidates")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);
      return results;
    }

    // No filter - return all candidates
    const results = await ctx.db.query("candidates").take(limit);
    return results;
  },
});

// Get a single candidate by ID
export const get = query({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.id);
    if (!candidate) {
      throw new Error(`Candidate ${args.id} not found`);
    }
    return candidate;
  },
});

// Create a new candidate
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    resumeText: v.optional(v.string()),
    aiScore: v.optional(v.number()),
    aiContentScore: v.optional(v.number()),
    skills: v.array(v.string()),
    experienceYears: v.optional(v.number()),
    education: v.optional(v.string()),
    source: v.string(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate email uniqueness
    const existing = await ctx.db
      .query("candidates")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error(`Candidate with email ${args.email} already exists`);
    }

    // Validate status
    const validStatuses = ["new", "screening", "interview", "offer", "hired", "rejected"];
    const status = args.status || "new";
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate AI scores
    if (args.aiScore !== undefined && (args.aiScore < 0 || args.aiScore > 100)) {
      throw new Error("AI score must be between 0 and 100");
    }
    if (args.aiContentScore !== undefined && (args.aiContentScore < 0 || args.aiContentScore > 100)) {
      throw new Error("AI content score must be between 0 and 100");
    }

    const candidateId = await ctx.db.insert("candidates", {
      ...args,
      status,
    });

    return candidateId;
  },
});

// Update an existing candidate
export const update = mutation({
  args: {
    id: v.id("candidates"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    resumeUrl: v.optional(v.string()),
    resumeText: v.optional(v.string()),
    aiScore: v.optional(v.number()),
    aiContentScore: v.optional(v.number()),
    skills: v.optional(v.array(v.string())),
    experienceYears: v.optional(v.number()),
    education: v.optional(v.string()),
    source: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const candidate = await ctx.db.get(id);
    if (!candidate) {
      throw new Error(`Candidate ${id} not found`);
    }

    // If email is being updated, check uniqueness
    if (updates.email && updates.email !== candidate.email) {
      const existing = await ctx.db
        .query("candidates")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();

      if (existing && existing._id !== id) {
        throw new Error(`Candidate with email ${updates.email} already exists`);
      }
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ["new", "screening", "interview", "offer", "hired", "rejected"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(", ")}`);
      }
    }

    // Validate AI scores
    if (updates.aiScore !== undefined && (updates.aiScore < 0 || updates.aiScore > 100)) {
      throw new Error("AI score must be between 0 and 100");
    }
    if (updates.aiContentScore !== undefined && (updates.aiContentScore < 0 || updates.aiContentScore > 100)) {
      throw new Error("AI content score must be between 0 and 100");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a candidate
export const remove = mutation({
  args: { id: v.id("candidates") },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.id);
    if (!candidate) {
      throw new Error(`Candidate ${args.id} not found`);
    }

    // Check for related applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_candidate", (q) => q.eq("candidateId", args.id))
      .first();

    if (applications) {
      throw new Error(`Cannot delete candidate with existing applications. Archive the candidate instead by setting status to 'rejected'.`);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Update candidate stage (for pipeline moves)
export const updateStage = mutation({
  args: {
    id: v.id("candidates"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const candidate = await ctx.db.get(args.id);
    if (!candidate) {
      throw new Error(`Candidate ${args.id} not found`);
    }

    const validStatuses = ["new", "screening", "interview", "offer", "hired", "rejected"];
    if (!validStatuses.includes(args.status)) {
      throw new Error(`Invalid status: ${args.status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    await ctx.db.patch(args.id, { status: args.status });
    return { success: true, id: args.id, status: args.status };
  },
});

// Bulk update candidate stages
export const bulkUpdateStage = mutation({
  args: {
    ids: v.array(v.id("candidates")),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const validStatuses = ["new", "screening", "interview", "offer", "hired", "rejected"];
    if (!validStatuses.includes(args.status)) {
      throw new Error(`Invalid status: ${args.status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    const results = [];
    for (const id of args.ids) {
      const candidate = await ctx.db.get(id);
      if (candidate) {
        await ctx.db.patch(id, { status: args.status });
        results.push({ id, success: true });
      } else {
        results.push({ id, success: false, error: "Not found" });
      }
    }

    return results;
  },
});

// List all unscored candidates (no aiScore) for batch grading
export const listUnscored = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    // Find all candidates
    const allCandidates = await ctx.db.query("candidates").take(limit * 2); // Get more to filter

    // Filter where aiScore is undefined or null
    const unscoredCandidates = allCandidates.filter(
      (candidate) => candidate.aiScore === undefined || candidate.aiScore === null
    );

    return unscoredCandidates.slice(0, limit);
  },
});
