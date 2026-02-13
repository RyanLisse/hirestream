import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool: Match Candidate to Job
 *
 * Matches a candidate CV against a specific job vacancy using Dutch government
 * procurement-style evaluation:
 *
 * 1. Knock-out Criteria (Hard Requirements)
 *    - If ANY knock-out is not met → REJECTED
 *    - Examples: minimum years of experience, required certifications, education level
 *
 * 2. Scoring Criteria (Weighted Soft Requirements)
 *    - Each criterion scored 1-5 stars
 *    - Weighted by importance (0-100%)
 *    - Examples: specific technology experience, domain knowledge, soft skills
 *
 * 3. Overall Match Score
 *    - Excellent (80+), Strong (70-79), Good (60-69), Weak (<60)
 *
 * Integration Note:
 * - Can be enhanced with LLM-based evaluation
 * - Could parse job requirements automatically
 * - Might integrate with CV parsing for structured data
 */

const knockoutCriterionSchema = z.object({
  criterion: z.string().describe('The requirement (e.g., "Minimum 5 years Java experience")'),
  required: z.boolean().describe('Must be met (true) or nice-to-have (false)'),
  met: z.boolean().optional().describe('Whether candidate meets this (will be evaluated)'),
});

const scoringCriterionSchema = z.object({
  criterion: z.string().describe('The requirement to score'),
  weight: z.number().min(0).max(100).describe('Importance weight (0-100)'),
  score: z.number().min(1).max(5).optional().describe('Score 1-5 stars (will be evaluated)'),
});

export const matchCandidateTool = createTool({
  id: 'match-candidate-to-job',
  description: 'Match a candidate CV against a job vacancy using knock-out criteria (pass/fail) and scoring criteria (weighted 1-5 stars)',
  inputSchema: z.object({
    candidateCV: z.string()
      .describe('Full text of candidate resume/CV'),
    jobDescription: z.string()
      .describe('Full job description and requirements'),
    knockoutCriteria: z.array(knockoutCriterionSchema)
      .describe('Hard requirements - if ANY not met, candidate is REJECTED'),
    scoringCriteria: z.array(scoringCriterionSchema)
      .describe('Soft requirements - scored 1-5 stars with weights'),
  }),
  execute: async ({ context }) => {
    const { candidateCV, jobDescription, knockoutCriteria, scoringCriteria } = context;

    // TODO: Replace with LLM-based evaluation
    // Use Claude to:
    // 1. Evaluate each knock-out criterion against CV
    // 2. Score each scoring criterion 1-5 based on CV evidence
    // 3. Provide justifications for each decision

    const knockoutResults = evaluateKnockouts(candidateCV, knockoutCriteria);
    const isRejected = knockoutResults.some(k => k.required && !k.met);

    const scoringResults = isRejected
      ? []
      : evaluateScoringCriteria(candidateCV, scoringCriteria);

    const overallScore = isRejected
      ? 0
      : calculateOverallScore(scoringResults);

    return {
      decision: isRejected ? 'REJECTED' : 'PASSED_KNOCKOUT',
      overallScore,
      matchLevel: getMatchLevel(overallScore),
      knockoutResults,
      scoringResults,
      summary: generateSummary(isRejected, overallScore, knockoutResults, scoringResults),
      recommendation: generateRecommendation(isRejected, overallScore),
    };
  },
});

/**
 * Evaluate knock-out criteria
 * Replace with LLM-based evaluation for production
 */
function evaluateKnockouts(cv: string, criteria: z.infer<typeof knockoutCriterionSchema>[]) {
  return criteria.map(criterion => {
    // Simple keyword matching for demo
    // In production: use LLM to evaluate properly
    const met = cv.toLowerCase().includes(
      criterion.criterion.toLowerCase().split(' ')[0]
    );

    return {
      ...criterion,
      met,
      justification: met
        ? `Evidence found in CV for: ${criterion.criterion}`
        : `No clear evidence for: ${criterion.criterion}`,
    };
  });
}

/**
 * Evaluate scoring criteria
 * Replace with LLM-based scoring for production
 */
function evaluateScoringCriteria(cv: string, criteria: z.infer<typeof scoringCriterionSchema>[]) {
  return criteria.map(criterion => {
    // Mock scoring - replace with LLM
    const score = Math.floor(Math.random() * 3) + 3; // 3-5 stars

    return {
      ...criterion,
      score,
      justification: `Scored ${score}/5 based on CV evidence`,
    };
  });
}

/**
 * Calculate weighted overall score
 */
function calculateOverallScore(results: any[]): number {
  if (results.length === 0) return 0;

  const totalWeight = results.reduce((sum, r) => sum + r.weight, 0);
  const weightedScore = results.reduce((sum, r) => {
    const normalized = (r.score / 5) * 100; // Convert 1-5 to 0-100
    return sum + (normalized * r.weight);
  }, 0);

  return Math.round(weightedScore / totalWeight);
}

function getMatchLevel(score: number): string {
  if (score >= 80) return 'Excellent Match';
  if (score >= 70) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  if (score > 0) return 'Weak Match';
  return 'Rejected';
}

function generateSummary(
  isRejected: boolean,
  score: number,
  knockouts: any[],
  scoring: any[]
): string {
  if (isRejected) {
    const failed = knockouts.filter(k => k.required && !k.met);
    return `Candidate REJECTED due to ${failed.length} failed knock-out criteria: ${failed.map(f => f.criterion).join(', ')}`;
  }

  return `Candidate passed all knock-out criteria. Overall score: ${score}/100 (${getMatchLevel(score)}). Based on ${scoring.length} scoring criteria.`;
}

function generateRecommendation(isRejected: boolean, score: number): string {
  if (isRejected) {
    return 'Do not proceed with this candidate - failed hard requirements';
  }

  if (score >= 80) {
    return 'Strong recommendation - Schedule interview immediately';
  }

  if (score >= 70) {
    return 'Good candidate - Proceed to interview stage';
  }

  if (score >= 60) {
    return 'Moderate fit - Consider as backup candidate';
  }

  return 'Weak match - Only consider if talent pool is limited';
}
