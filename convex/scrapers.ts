import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List scraper configurations
export const listConfigs = query({
  args: {
    active: v.optional(v.boolean()),
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { active, platform, limit = 50 } = args;

    if (active !== undefined) {
      const results = await ctx.db
        .query("scraperConfigs")
        .withIndex("by_active", (q) => q.eq("active", active))
        .take(limit);

      // Filter by platform if provided
      if (platform) {
        return results.filter(config => config.platform === platform);
      }

      return results;
    }

    if (platform) {
      const results = await ctx.db
        .query("scraperConfigs")
        .withIndex("by_platform", (q) => q.eq("platform", platform))
        .take(limit);

      return results;
    }

    // No filter - return all configs
    const results = await ctx.db.query("scraperConfigs").take(limit);
    return results;
  },
});

// Get a single scraper config by ID
export const getConfig = query({
  args: { id: v.id("scraperConfigs") },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.id);
    if (!config) {
      throw new Error(`Scraper config ${args.id} not found`);
    }
    return config;
  },
});

// Create a new scraper configuration
export const createConfig = mutation({
  args: {
    platform: v.string(),
    baseUrl: v.string(),
    searchQuery: v.string(),
    selectors: v.optional(v.any()),
    schedule: v.string(),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Validate schedule
    const validSchedules = ["hourly", "daily", "weekly"];
    if (!validSchedules.includes(args.schedule)) {
      throw new Error(`Invalid schedule: ${args.schedule}. Must be one of: ${validSchedules.join(", ")}`);
    }

    // Validate URL format
    try {
      new URL(args.baseUrl);
    } catch (e) {
      throw new Error(`Invalid base URL: ${args.baseUrl}`);
    }

    const configId = await ctx.db.insert("scraperConfigs", {
      platform: args.platform,
      baseUrl: args.baseUrl,
      searchQuery: args.searchQuery,
      selectors: args.selectors,
      schedule: args.schedule,
      active: args.active !== undefined ? args.active : true,
      lastRun: undefined,
      lastJobsFound: undefined,
    });

    return configId;
  },
});

// Update an existing scraper configuration
export const updateConfig = mutation({
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

    // Validate schedule if provided
    if (updates.schedule) {
      const validSchedules = ["hourly", "daily", "weekly"];
      if (!validSchedules.includes(updates.schedule)) {
        throw new Error(`Invalid schedule: ${updates.schedule}. Must be one of: ${validSchedules.join(", ")}`);
      }
    }

    // Validate URL format if provided
    if (updates.baseUrl) {
      try {
        new URL(updates.baseUrl);
      } catch (e) {
        throw new Error(`Invalid base URL: ${updates.baseUrl}`);
      }
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// Delete a scraper configuration
export const removeConfig = mutation({
  args: { id: v.id("scraperConfigs") },
  handler: async (ctx, args) => {
    const config = await ctx.db.get(args.id);
    if (!config) {
      throw new Error(`Scraper config ${args.id} not found`);
    }

    // Check for related results
    const results = await ctx.db
      .query("scrapeResults")
      .withIndex("by_config", (q) => q.eq("configId", args.id))
      .first();

    if (results) {
      throw new Error(`Cannot delete scraper config with existing results. Deactivate instead by setting active to false.`);
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// List scrape results
export const listResults = query({
  args: {
    configId: v.optional(v.id("scraperConfigs")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { configId, limit = 100 } = args;

    if (configId) {
      const results = await ctx.db
        .query("scrapeResults")
        .withIndex("by_config", (q) => q.eq("configId", configId))
        .order("desc")
        .take(limit);

      return results;
    }

    // No filter - return all results, most recent first
    const results = await ctx.db
      .query("scrapeResults")
      .withIndex("by_runAt")
      .order("desc")
      .take(limit);

    return results;
  },
});

// Save a scrape result
export const saveResult = mutation({
  args: {
    configId: v.id("scraperConfigs"),
    jobsFound: v.number(),
    jobsNew: v.number(),
    errors: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify config exists
    const config = await ctx.db.get(args.configId);
    if (!config) {
      throw new Error(`Scraper config ${args.configId} not found`);
    }

    const runAt = Date.now();

    // Create result record
    const resultId = await ctx.db.insert("scrapeResults", {
      configId: args.configId,
      jobsFound: args.jobsFound,
      jobsNew: args.jobsNew,
      errors: args.errors,
      runAt,
    });

    // Update config with last run info
    await ctx.db.patch(args.configId, {
      lastRun: runAt,
      lastJobsFound: args.jobsFound,
    });

    return resultId;
  },
});

// Save scraped jobs (with deduplication)
export const saveScrapedJobs = mutation({
  args: {
    configId: v.id("scraperConfigs"),
    jobs: v.array(v.object({
      title: v.string(),
      department: v.string(),
      location: v.string(),
      type: v.string(),
      description: v.string(),
      requirements: v.array(v.string()),
      externalUrl: v.string(),
      salary: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Verify config exists
    const config = await ctx.db.get(args.configId);
    if (!config) {
      throw new Error(`Scraper config ${args.configId} not found`);
    }

    let newJobsCount = 0;
    let duplicateCount = 0;
    const createdIds = [];

    for (const jobData of args.jobs) {
      // Check for duplicate by external URL
      const existingJobs = await ctx.db.query("jobs").collect();
      const duplicate = existingJobs.find(job => job.externalUrl === jobData.externalUrl);

      if (duplicate) {
        duplicateCount++;
        continue;
      }

      // Validate job type
      const validTypes = ["full-time", "part-time", "contract", "internship"];
      if (!validTypes.includes(jobData.type)) {
        // Skip invalid job types instead of throwing
        continue;
      }

      // Create new job
      const jobId = await ctx.db.insert("jobs", {
        title: jobData.title,
        department: jobData.department,
        location: jobData.location,
        type: jobData.type,
        description: jobData.description,
        requirements: jobData.requirements,
        knockOutCriteria: undefined,
        scoringCriteria: undefined,
        status: "active",
        platformSource: config.platform,
        externalUrl: jobData.externalUrl,
        scrapedAt: Date.now(),
        salary: jobData.salary,
      });

      createdIds.push(jobId);
      newJobsCount++;
    }

    // Save result directly
    const runAt = Date.now();
    await ctx.db.insert("scrapeResults", {
      configId: args.configId,
      jobsFound: args.jobs.length,
      jobsNew: newJobsCount,
      errors: duplicateCount > 0 ? `${duplicateCount} duplicates skipped` : undefined,
      runAt,
    });
    await ctx.db.patch(args.configId, {
      lastRun: runAt,
      lastJobsFound: args.jobs.length,
    });

    return {
      success: true,
      totalScraped: args.jobs.length,
      newJobs: newJobsCount,
      duplicates: duplicateCount,
      createdIds,
    };
  },
});
