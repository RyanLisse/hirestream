import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get a single context value by key
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const context = await ctx.db
      .query("agentContext")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    return context ? context.value : null;
  },
});

// Set or update a context value (upsert)
export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentContext")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    const updatedAt = Date.now();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt,
      });
      return existing._id;
    } else {
      // Create new
      const id = await ctx.db.insert("agentContext", {
        key: args.key,
        value: args.value,
        updatedAt,
      });
      return id;
    }
  },
});

// List all context entries
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100;

    const results = await ctx.db
      .query("agentContext")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(limit);

    return results;
  },
});

// Delete a context entry
export const remove = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentContext")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (!existing) {
      throw new Error(`Context key "${args.key}" not found`);
    }

    await ctx.db.delete(existing._id);
    return { success: true };
  },
});

// Get system context for agent with current stats
export const getSystemContext = query({
  args: {},
  handler: async (ctx, args) => {
    // Get dashboard stats
    const candidates = await ctx.db.query("candidates").collect();
    const jobs = await ctx.db.query("jobs").collect();
    const applications = await ctx.db.query("applications").collect();
    const interviews = await ctx.db.query("interviews").collect();

    // Calculate stats
    const totalCandidates = candidates.length;
    const activeJobs = jobs.filter(j => j.status === "active").length;
    const totalApplications = applications.length;

    const scoredCandidates = candidates.filter(c => c.aiScore !== undefined && c.aiScore !== null);
    const avgAiScore = scoredCandidates.length > 0
      ? scoredCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / scoredCandidates.length
      : 0;

    // Pipeline breakdown
    const pipelineStages = {
      new: candidates.filter(c => c.status === "new").length,
      screening: candidates.filter(c => c.status === "screening").length,
      interview: candidates.filter(c => c.status === "interview").length,
      offer: candidates.filter(c => c.status === "offer").length,
      hired: candidates.filter(c => c.status === "hired").length,
      rejected: candidates.filter(c => c.status === "rejected").length,
    };

    // Interview stats
    const upcomingInterviews = interviews.filter(i => i.status === "scheduled").length;
    const completedInterviews = interviews.filter(i => i.status === "completed").length;

    // Get recent context entries
    const recentContext = await ctx.db
      .query("agentContext")
      .withIndex("by_updatedAt")
      .order("desc")
      .take(10);

    // Build context string
    const contextString = `
HireStream Recruitment Platform - System Context

DASHBOARD STATS:
- Total Candidates: ${totalCandidates}
- Active Jobs: ${activeJobs}
- Total Applications: ${totalApplications}
- Average AI Score: ${avgAiScore.toFixed(1)}

PIPELINE:
- New: ${pipelineStages.new}
- Screening: ${pipelineStages.screening}
- Interview: ${pipelineStages.interview}
- Offer: ${pipelineStages.offer}
- Hired: ${pipelineStages.hired}
- Rejected: ${pipelineStages.rejected}

INTERVIEWS:
- Upcoming: ${upcomingInterviews}
- Completed: ${completedInterviews}

RECENT CONTEXT:
${recentContext.map(ctx => `- ${ctx.key}: ${ctx.value.substring(0, 100)}${ctx.value.length > 100 ? '...' : ''}`).join('\n')}

System timestamp: ${new Date().toISOString()}
    `.trim();

    return {
      contextString,
      stats: {
        totalCandidates,
        activeJobs,
        totalApplications,
        avgAiScore,
        pipelineStages,
        upcomingInterviews,
        completedInterviews,
      },
      recentContext,
    };
  },
});
