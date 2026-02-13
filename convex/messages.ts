import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List messages with optional filtering
export const list = query({
  args: {
    applicationId: v.optional(v.id("applications")),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { applicationId, status, limit = 100 } = args;

    if (applicationId) {
      const results = await ctx.db
        .query("messages")
        .withIndex("by_application", (q) => q.eq("applicationId", applicationId))
        .take(limit);

      // Filter by status if provided
      if (status) {
        return results.filter(message => message.status === status);
      }

      return results;
    }

    if (status) {
      const results = await ctx.db
        .query("messages")
        .withIndex("by_status", (q) => q.eq("status", status))
        .take(limit);

      return results;
    }

    // No filter - return all messages
    const results = await ctx.db.query("messages").take(limit);
    return results;
  },
});

// Get a single message by ID
export const get = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error(`Message ${args.id} not found`);
    }
    return message;
  },
});

// Create a new message
export const create = mutation({
  args: {
    applicationId: v.optional(v.id("applications")),
    template: v.string(),
    subject: v.string(),
    body: v.string(),
    recipients: v.number(),
    status: v.optional(v.string()),
    openRate: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify application exists if provided
    if (args.applicationId) {
      const application = await ctx.db.get(args.applicationId);
      if (!application) {
        throw new Error(`Application ${args.applicationId} not found`);
      }
    }

    // Validate status
    const validStatuses = ["sent", "draft", "scheduled"];
    const status = args.status || "draft";
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(", ")}`);
    }

    // Validate recipients count
    if (args.recipients < 0) {
      throw new Error("Recipients count must be non-negative");
    }

    // Validate open rate if provided
    if (args.openRate !== undefined && (args.openRate < 0 || args.openRate > 100)) {
      throw new Error("Open rate must be between 0 and 100");
    }

    // If status is sent, ensure sentAt is provided
    if (status === "sent" && !args.sentAt) {
      throw new Error("sentAt is required for sent messages");
    }

    const messageId = await ctx.db.insert("messages", {
      ...args,
      status,
    });

    return messageId;
  },
});

// Update an existing message
export const update = mutation({
  args: {
    id: v.id("messages"),
    template: v.optional(v.string()),
    subject: v.optional(v.string()),
    body: v.optional(v.string()),
    recipients: v.optional(v.number()),
    status: v.optional(v.string()),
    openRate: v.optional(v.number()),
    sentAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const message = await ctx.db.get(id);
    if (!message) {
      throw new Error(`Message ${id} not found`);
    }

    // Cannot update sent messages except for open rate
    if (message.status === "sent" && updates.status !== "sent") {
      const allowedUpdates = ["openRate"];
      const attemptedUpdates = Object.keys(updates).filter(key => key !== "openRate");
      if (attemptedUpdates.length > 0) {
        throw new Error("Cannot update sent messages except for open rate");
      }
    }

    // Validate status if provided
    if (updates.status) {
      const validStatuses = ["sent", "draft", "scheduled"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(", ")}`);
      }
    }

    // Validate recipients count if provided
    if (updates.recipients !== undefined && updates.recipients < 0) {
      throw new Error("Recipients count must be non-negative");
    }

    // Validate open rate if provided
    if (updates.openRate !== undefined && (updates.openRate < 0 || updates.openRate > 100)) {
      throw new Error("Open rate must be between 0 and 100");
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a message
export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error(`Message ${args.id} not found`);
    }

    // Cannot delete sent messages
    if (message.status === "sent") {
      throw new Error("Cannot delete sent messages");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Send a message (mark as sent)
export const send = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.id);
    if (!message) {
      throw new Error(`Message ${args.id} not found`);
    }

    if (message.status === "sent") {
      throw new Error("Message has already been sent");
    }

    await ctx.db.patch(args.id, {
      status: "sent",
      sentAt: Date.now(),
    });

    return { success: true, id: args.id };
  },
});
