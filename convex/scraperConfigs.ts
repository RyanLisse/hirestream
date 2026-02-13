/**
 * Scraper Config Queries and Mutations
 *
 * Database operations for job scraper configurations
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all scraper configs
 */
export const list = query({
  args: {
    active: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { active, limit = 50 } = args;

    if (active !== undefined) {
      return await ctx.db
        .query("scraperConfigs")
        .withIndex("by_active", (q) => q.eq("active", active))
        .take(limit);
    }

    return await ctx.db.query("scraperConfigs").take(limit);
  },
});

/**
 * Get a scraper config by ID
 */
export const get = query({
  args: { id: v.id("scraperConfigs") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Create a scraper config
 */
export const create = mutation({
  args: {
    platform: v.string(),
    baseUrl: v.string(),
    searchQuery: v.string(),
    selectors: v.optional(v.any()),
    schedule: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const validSchedules = ["hourly", "daily", "weekly"];
    if (!validSchedules.includes(args.schedule)) {
      throw new Error(`Invalid schedule: ${args.schedule}. Must be one of: ${validSchedules.join(", ")}`);
    }

    const configId = await ctx.db.insert("scraperConfigs", {
      platform: args.platform,
      baseUrl: args.baseUrl,
      searchQuery: args.searchQuery,
      selectors: args.selectors,
      schedule: args.schedule,
      active: args.active,
    });

    return configId;
  },
});

/**
 * Update a scraper config
 */
export const update = mutation({
  args: {
    id: v.id("scraperConfigs"),
    platform: v.optional(v.string()),
    baseUrl: v.optional(v.string()),
    searchQuery: v.optional(v.string()),
    selectors: v.optional(v.any()),
    schedule: v.optional(v.string()),
    active: v.optional(v.boolean()),
    lastRun: v.optional(v.number()),
    lastJobsFound: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const config = await ctx.db.get(id);
    if (!config) {
      throw new Error(`Scraper config ${id} not found`);
    }

    if (updates.schedule) {
      const validSchedules = ["hourly", "daily", "weekly"];
      if (!validSchedules.includes(updates.schedule)) {
        throw new Error(`Invalid schedule: ${updates.schedule}. Must be one of: ${validSchedules.join(", ")}`);
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});
