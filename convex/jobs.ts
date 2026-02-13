import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List jobs with optional filtering and pagination
export const list = query({
  args: {
    status: v.optional(v.string()),
    department: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { status, department, search, limit = 50 } = args;

    if (search) {
      // Use search index with all filters applied at once
      const results = await ctx.db
        .query("jobs")
        .withSearchIndex("search_jobs", (q) => {
          let query = q.search("title", search);
          if (status) query = query.eq("status", status);
          if (department) query = query.eq("department", department);
          return query;
        })
        .take(limit);
      return results;
    }

    if (status) {
      // Use status index for filtered queries
      const results = await ctx.db
        .query("jobs")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);

      // Filter by department if provided
      if (department) {
        return results.filter(job => job.department === department);
      }

      return results;
    }

    // No filter - return all jobs
    const results = await ctx.db.query("jobs").take(limit);

    // Filter by department if provided
    if (department) {
      return results.filter(job => job.department === department);
    }

    return results;
  },
});

// Get a single job by ID
export const get = query({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error(`Job ${args.id} not found`);
    }
    return job;
  },
});

// Create a new job
export const create = mutation({
  args: {
    title: v.string(),
    department: v.string(),
    location: v.string(),
    type: v.string(),
    description: v.string(),
    requirements: v.array(v.string()),
    knockOutCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      description: v.string(),
      required: v.boolean(),
    }))),
    scoringCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      weight: v.number(),
      description: v.string(),
    }))),
    status: v.optional(v.string()),
    platformSource: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    scrapedAt: v.optional(v.number()),
    salary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate status
    const validStatuses = ["active", "paused", "closed"];
    const status = args.status || "active";
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate job type
    const validTypes = ["full-time", "part-time", "contract", "internship"];
    if (!validTypes.includes(args.type)) {
      throw new Error(`Invalid type: ${args.type}. Must be one of: ${validTypes.join(", ")}`);
    }

    // Validate scoring criteria weights sum to 1.0 or less
    if (args.scoringCriteria) {
      const totalWeight = args.scoringCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      if (totalWeight > 1.0) {
        throw new Error(`Scoring criteria weights sum to ${totalWeight}, must be <= 1.0`);
      }
    }

    const jobId = await ctx.db.insert("jobs", {
      ...args,
      status,
    });

    return jobId;
  },
});

// Update an existing job
export const update = mutation({
  args: {
    id: v.id("jobs"),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    location: v.optional(v.string()),
    type: v.optional(v.string()),
    description: v.optional(v.string()),
    requirements: v.optional(v.array(v.string())),
    knockOutCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      description: v.string(),
      required: v.boolean(),
    }))),
    scoringCriteria: v.optional(v.array(v.object({
      criterion: v.string(),
      weight: v.number(),
      description: v.string(),
    }))),
    status: v.optional(v.string()),
    platformSource: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    scrapedAt: v.optional(v.number()),
    salary: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const job = await ctx.db.get(id);
    if (!job) {
      throw new Error(`Job ${id} not found`);
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ["active", "paused", "closed"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(", ")}`);
      }
    }

    // Validate job type if provided
    if (updates.type) {
      const validTypes = ["full-time", "part-time", "contract", "internship"];
      if (!validTypes.includes(updates.type)) {
        throw new Error(`Invalid type: ${updates.type}. Must be one of: ${validTypes.join(", ")}`);
      }
    }

    // Validate scoring criteria weights if provided
    if (updates.scoringCriteria) {
      const totalWeight = updates.scoringCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
      if (totalWeight > 1.0) {
        throw new Error(`Scoring criteria weights sum to ${totalWeight}, must be <= 1.0`);
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a job
export const remove = mutation({
  args: { id: v.id("jobs") },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.id);
    if (!job) {
      throw new Error(`Job ${args.id} not found`);
    }

    // Check for related applications
    const applications = await ctx.db
      .query("applications")
      .withIndex("by_job", (q) => q.eq("jobId", args.id))
      .first();

    if (applications) {
      throw new Error(`Cannot delete job with existing applications. Close the job instead by setting status to 'closed'.`);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
