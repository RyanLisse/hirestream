"use node";

/**
 * Recruitment Agent
 *
 * An AI agent that helps with recruitment tasks using Claude
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { buildRecruitmentAgentPrompt } from "../lib/ai/agent-prompt";
import type { AgentContext } from "../lib/ai/agent-prompt";
import { api } from "./_generated/api";

/**
 * Run the recruitment agent
 *
 * Takes a user message and returns the agent's response after analyzing
 * current system state and executing any requested actions
 */
export const runAgent = action({
  args: {
    userMessage: v.string(),
  },
  handler: async (ctx, args): Promise<{ response: string; context: AgentContext }> => {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    // 1. Build dynamic context from current DB state
    const context = await buildAgentContext(ctx);

    // 2. Build system prompt with context
    const systemPrompt = buildRecruitmentAgentPrompt(context);

    // 3. Use Claude to process the user message
    try {
      const { text } = await generateText({
        model: anthropic("claude-3-5-sonnet-20241022"),
        system: systemPrompt,
        prompt: args.userMessage,
        maxOutputTokens: 2048,
      });

      return {
        response: text,
        context,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to run agent: ${error.message}`);
      }
      throw new Error("Failed to run agent: Unknown error");
    }
  },
});

/**
 * Build agent context from current database state
 */
async function buildAgentContext(ctx: any): Promise<AgentContext> {
  // Get total candidates count
  const allCandidates = await ctx.runQuery(api.candidates.list, { limit: 1000 });
  const totalCandidates = allCandidates.length;

  // Get active jobs
  const activeJobsData = await ctx.runQuery(api.jobs.list, { status: "active", limit: 50 });
  const activeJobs = activeJobsData.map((job: any) => ({
    id: job._id,
    title: job.title,
    department: job.department,
  }));

  // Get pipeline stats
  const pipelineStages = ["new", "screening", "interview", "offer", "hired", "rejected"];
  const pipelineStats = await Promise.all(
    pipelineStages.map(async (stage) => {
      const candidates = await ctx.runQuery(api.candidates.list, { status: stage, limit: 1000 });
      return { stage, count: candidates.length };
    })
  );

  // Get scraper configs (if any exist)
  let scraperConfigs: { platform: string; active: boolean; lastRun?: string }[] = [];
  try {
    const configs = await ctx.runQuery(api.scraperConfigs.list, {});
    scraperConfigs = configs.map((config: any) => ({
      platform: config.platform,
      active: config.active,
      lastRun: config.lastRun ? new Date(config.lastRun).toLocaleDateString() : undefined,
    }));
  } catch (error) {
    // Scraper configs may not exist yet, that's okay
    scraperConfigs = [];
  }

  // Build recent activity (placeholder - would need activity log in real implementation)
  const recentActivity = [
    `${totalCandidates} total candidates in database`,
    `${activeJobs.length} active job postings`,
    `Pipeline: ${pipelineStats.find((s) => s.stage === "new")?.count || 0} new applications`,
  ];

  return {
    totalCandidates,
    activeJobs,
    pipelineStats,
    recentActivity,
    scraperConfigs,
  };
}
