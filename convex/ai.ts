"use node";

/**
 * AI Convex Actions
 *
 * Wraps the AI library functions (resume grader, CV matcher) as Convex actions
 * for use in the HireStream recruitment platform.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { gradeResume as gradeResumeLib } from "../lib/ai/resume-grader";
import { matchCandidateToJob as matchCandidateToJobLib } from "../lib/ai/cv-matcher";
import type { ResumeGrade, MatchResult, KnockOutCriterion, ScoringCriterion } from "../lib/ai/types";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

/**
 * Grade a resume (text input)
 *
 * Takes resume text and optional job description, returns AI grading analysis
 */
export const gradeResume = action({
  args: {
    resumeText: v.string(),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ResumeGrade> => {
    if (!args.resumeText || args.resumeText.trim().length === 0) {
      throw new Error("Resume text cannot be empty");
    }

    try {
      const grade = await gradeResumeLib(args.resumeText, args.jobDescription);
      return grade;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to grade resume: ${error.message}`);
      }
      throw new Error("Failed to grade resume: Unknown error");
    }
  },
});

/**
 * Match candidate to job
 *
 * Fetches candidate and job from DB, runs CV-vacancy matcher, saves results to application record
 */
export const matchCandidateToJob = action({
  args: {
    candidateId: v.id("candidates"),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args): Promise<MatchResult> => {
    // 1. Fetch candidate and job from DB
    const candidate = await ctx.runQuery(api.candidates.get, { id: args.candidateId });
    if (!candidate) {
      throw new Error(`Candidate not found: ${args.candidateId}`);
    }

    const job = await ctx.runQuery(api.jobs.get, { id: args.jobId });
    if (!job) {
      throw new Error(`Job not found: ${args.jobId}`);
    }

    if (!candidate.resumeText || candidate.resumeText.trim().length === 0) {
      throw new Error("Candidate resume text is empty - cannot match");
    }

    // 2. Prepare knock-out and scoring criteria
    const knockOutCriteria: KnockOutCriterion[] | undefined = job.knockOutCriteria?.map((ko) => ({
      id: ko.criterion.toLowerCase().replace(/\s+/g, "-"),
      criterion: ko.criterion,
      required: ko.required,
    }));

    const scoringCriteria: ScoringCriterion[] | undefined = job.scoringCriteria?.map((sc) => ({
      id: sc.criterion.toLowerCase().replace(/\s+/g, "-"),
      criterion: sc.criterion,
      weight: sc.weight,
    }));

    // 3. Run matcher
    const matchResult = await matchCandidateToJobLib({
      resumeText: candidate.resumeText,
      job: {
        id: job._id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        applicants: 0, // Not needed for matching
        status: job.status as "active" | "paused" | "closed",
        postedDate: "", // Not needed for matching
        requiredSkills: job.requirements || [],
      },
      knockOutCriteria,
      scoringCriteria,
    });

    // 4. Find or create application record
    const existingApplication = await ctx.runQuery(api.applications.findByCandidate, {
      candidateId: args.candidateId,
      jobId: args.jobId,
    });

    if (existingApplication) {
      // Update existing application with match results
      await ctx.runMutation(api.applications.update, {
        id: existingApplication._id,
        aiMatchScore: matchResult.totalWeightedScore,
        knockOutResults: matchResult.knockOutResults,
        scoringResults: matchResult.scoringResults,
      });
    } else {
      // Create new application with match results
      await ctx.runMutation(api.applications.create, {
        candidateId: args.candidateId,
        jobId: args.jobId,
        status: matchResult.knockOutsPassed ? "active" : "rejected",
        stage: matchResult.knockOutsPassed ? "new" : "rejected",
        aiMatchScore: matchResult.totalWeightedScore,
        knockOutResults: matchResult.knockOutResults,
        scoringResults: matchResult.scoringResults,
      });
    }

    // 5. Return the full MatchResult
    return matchResult;
  },
});

/**
 * Grade and store - grades a resume and updates the candidate record
 */
export const gradeAndStore = action({
  args: {
    candidateId: v.id("candidates"),
    jobDescription: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<ResumeGrade> => {
    // 1. Fetch candidate's resumeText
    const candidate = await ctx.runQuery(api.candidates.get, { id: args.candidateId });
    if (!candidate) {
      throw new Error(`Candidate not found: ${args.candidateId}`);
    }

    if (!candidate.resumeText || candidate.resumeText.trim().length === 0) {
      throw new Error("Candidate resume text is empty - cannot grade");
    }

    // 2. Grade it
    const grade = await gradeResumeLib(candidate.resumeText, args.jobDescription);

    // 3. Update candidate with scores
    await ctx.runMutation(api.candidates.update, {
      id: args.candidateId,
      aiScore: grade.overallScore,
      aiContentScore: grade.aiContentScore,
      skills: grade.skills,
      experienceYears: grade.experienceYears,
      education: grade.education,
    });

    // 4. Return grade
    return grade;
  },
});

/**
 * Batch grade all unscored candidates
 */
export const batchGrade = action({
  args: {
    jobDescription: v.optional(v.string()),
    limit: v.optional(v.number()), // Max candidates to grade in one batch
  },
  handler: async (ctx, args): Promise<{
    total: number;
    graded: number;
    failed: number;
    errors: { candidateId: Id<"candidates">; error: string }[];
  }> => {
    // Find candidates with no aiScore
    const unscoredCandidates = await ctx.runQuery(api.candidates.listUnscored, {
      limit: args.limit || 50,
    });

    const results = {
      total: unscoredCandidates.length,
      graded: 0,
      failed: 0,
      errors: [] as { candidateId: Id<"candidates">; error: string }[],
    };

    // Grade each one
    for (const candidate of unscoredCandidates) {
      try {
        if (!candidate.resumeText || candidate.resumeText.trim().length === 0) {
          results.failed++;
          results.errors.push({
            candidateId: candidate._id,
            error: "Resume text is empty",
          });
          continue;
        }

        const grade = await gradeResumeLib(candidate.resumeText, args.jobDescription);

        await ctx.runMutation(api.candidates.update, {
          id: candidate._id,
          aiScore: grade.overallScore,
          aiContentScore: grade.aiContentScore,
          skills: grade.skills,
          experienceYears: grade.experienceYears,
          education: grade.education,
        });

        results.graded++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          candidateId: candidate._id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
