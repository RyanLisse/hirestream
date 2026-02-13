import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List interviews with optional filtering
export const list = query({
  args: {
    applicationId: v.optional(v.id("applications")),
    status: v.optional(v.string()),
    date: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { applicationId, status, date, limit = 100 } = args;

    if (applicationId) {
      const results = await ctx.db
        .query("interviews")
        .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
        .take(limit);

      // Filter by status if provided
      if (status) {
        return results.filter(interview => interview.status === status);
      }

      return results;
    }

    if (status) {
      const results = await ctx.db
        .query("interviews")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);

      // Filter by date if provided
      if (date) {
        return results.filter(interview => interview.date === date);
      }

      return results;
    }

    if (date) {
      const results = await ctx.db
        .query("interviews")
        .withIndex("by_date", (q) => q.eq("date", date))
        .take(limit);

      return results;
    }

    // No filter - return all interviews
    const results = await ctx.db.query("interviews").take(limit);
    return results;
  },
});

// Get a single interview by ID
export const get = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    if (!interview) {
      throw new Error(`Interview ${args.id} not found`);
    }
    return interview;
  },
});

// Get interview with application details
export const getWithDetails = query({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    if (!interview) {
      throw new Error(`Interview ${args.id} not found`);
    }

    const application = await ctx.db.get(interview.applicationId);
    if (!application) {
      return interview;
    }

    const candidate = await ctx.db.get(application.candidateId);
    const job = await ctx.db.get(application.jobId);

    return {
      ...interview,
      application: {
        ...application,
        candidate,
        job,
      },
    };
  },
});

// Create a new interview
export const create = mutation({
  args: {
    applicationId: v.id("applications"),
    candidateName: v.string(),
    role: v.string(),
    type: v.string(),
    date: v.string(),
    time: v.string(),
    interviewer: v.string(),
    status: v.optional(v.string()),
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify application exists
    const application = await ctx.db.get(args.applicationId);
    if (!application) {
      throw new Error(`Application ${args.applicationId} not found`);
    }

    // Validate interview type
    const validTypes = ["phone", "video", "onsite", "technical"];
    if (!validTypes.includes(args.type)) {
      throw new Error(`Invalid type: ${args.type}. Must be one of: ${validTypes.join(", ")}`);
    }

    // Validate status
    const validStatuses = ["scheduled", "completed", "cancelled"];
    const status = args.status || "scheduled";
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate rating if provided
    if (args.rating !== undefined && (args.rating < 1 || args.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(args.date)) {
      throw new Error("Date must be in YYYY-MM-DD format");
    }

    // Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(args.time)) {
      throw new Error("Time must be in HH:MM format");
    }

    const interviewId = await ctx.db.insert("interviews", {
      ...args,
      status,
    });

    return interviewId;
  },
});

// Update an existing interview
export const update = mutation({
  args: {
    id: v.id("interviews"),
    candidateName: v.optional(v.string()),
    role: v.optional(v.string()),
    type: v.optional(v.string()),
    date: v.optional(v.string()),
    time: v.optional(v.string()),
    interviewer: v.optional(v.string()),
    status: v.optional(v.string()),
    feedback: v.optional(v.string()),
    rating: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const interview = await ctx.db.get(id);
    if (!interview) {
      throw new Error(`Interview ${id} not found`);
    }

    // Validate interview type if provided
    if (updates.type) {
      const validTypes = ["phone", "video", "onsite", "technical"];
      if (!validTypes.includes(updates.type)) {
        throw new Error(`Invalid type: ${updates.type}. Must be one of: ${validTypes.join(", ")}`);
      }
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ["scheduled", "completed", "cancelled"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(", ")}`);
      }
    }

    // Validate rating if provided
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    // Validate date format if provided
    if (updates.date) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updates.date)) {
        throw new Error("Date must be in YYYY-MM-DD format");
      }
    }

    // Validate time format if provided
    if (updates.time) {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(updates.time)) {
        throw new Error("Time must be in HH:MM format");
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete an interview
export const remove = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    if (!interview) {
      throw new Error(`Interview ${args.id} not found`);
    }

    // Only allow deletion of scheduled interviews
    if (interview.status === "completed") {
      throw new Error("Cannot delete completed interviews. Cancel instead by setting status to 'cancelled'.");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Cancel an interview
export const cancel = mutation({
  args: { id: v.id("interviews") },
  handler: async (ctx, args) => {
    const interview = await ctx.db.get(args.id);
    if (!interview) {
      throw new Error(`Interview ${args.id} not found`);
    }

    if (interview.status === "cancelled") {
      throw new Error("Interview is already cancelled");
    }

    if (interview.status === "completed") {
      throw new Error("Cannot cancel a completed interview");
    }

    await ctx.db.patch(args.id, { status: "cancelled" });
    return { success: true, id: args.id };
  },
});
