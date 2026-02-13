import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool: Grade Candidate
 *
 * Analyzes a candidate's resume/CV and provides a comprehensive grading.
 *
 * Grading Criteria:
 * - Skill Match: Relevance of technical skills
 * - Experience Relevance: Quality and recency of experience
 * - Resume Quality: Clarity, structure, professionalism
 * - AI Content Detection: Identifies likely AI-generated content
 *
 * Returns overall score (0-100) and breakdown by category.
 *
 * Integration Note:
 * This could be enhanced with:
 * - PDF parsing for resume files
 * - NLP/embedding-based skill extraction
 * - AI-content detection models
 * - Comparison against job requirements
 */

export const gradeCandidateTool = createTool({
  id: 'grade-candidate',
  description: 'Grade a candidate resume on skill match, experience, quality, and detect AI-generated content. Returns score 0-100.',
  inputSchema: z.object({
    resumeText: z.string()
      .describe('Full text content of the candidate resume/CV'),
    jobContext: z.string().optional()
      .describe('Optional: Job description or requirements to compare against'),
  }),
  execute: async ({ context }) => {
    const { resumeText, jobContext } = context;

    // TODO: Enhance with actual analysis
    // - Use LLM to extract skills and evaluate relevance
    // - Compare against job requirements if provided
    // - Detect AI patterns (repetitive phrasing, generic statements)
    // - Analyze structure and professionalism

    const analysis = analyzeResume(resumeText, jobContext);

    return {
      overallScore: analysis.overallScore,
      breakdown: {
        skillMatch: analysis.skillMatch,
        experienceRelevance: analysis.experienceRelevance,
        resumeQuality: analysis.resumeQuality,
        aiContentLikelihood: analysis.aiContentLikelihood,
      },
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      recommendations: analysis.recommendations,
      verdict: getVerdict(analysis.overallScore),
      message: `Candidate scored ${analysis.overallScore}/100. ${getVerdict(analysis.overallScore)}`,
    };
  },
});

/**
 * Mock resume analysis
 * Replace with LLM-based or rule-based analysis
 */
function analyzeResume(resumeText: string, jobContext?: string) {
  // Simple heuristics for demonstration
  const wordCount = resumeText.split(/\s+/).length;
  const hasKeywords = /typescript|javascript|react|node|python/i.test(resumeText);
  const hasExperience = /\d+\s*years?/i.test(resumeText);
  const hasEducation = /university|bachelor|master|hbo|wo/i.test(resumeText);

  // Mock scoring
  const skillMatch = hasKeywords ? 75 + Math.random() * 20 : 40 + Math.random() * 30;
  const experienceRelevance = hasExperience ? 70 + Math.random() * 25 : 45 + Math.random() * 25;
  const resumeQuality = wordCount > 200 ? 80 + Math.random() * 15 : 50 + Math.random() * 30;
  const aiContentLikelihood = Math.random() * 40; // Low AI likelihood in this mock

  const overallScore = Math.round(
    (skillMatch * 0.35) +
    (experienceRelevance * 0.3) +
    (resumeQuality * 0.25) +
    ((100 - aiContentLikelihood) * 0.1)
  );

  return {
    overallScore,
    skillMatch: Math.round(skillMatch),
    experienceRelevance: Math.round(experienceRelevance),
    resumeQuality: Math.round(resumeQuality),
    aiContentLikelihood: Math.round(aiContentLikelihood),
    strengths: [
      hasKeywords && 'Strong technical skills mentioned',
      hasExperience && 'Clear experience timeline',
      hasEducation && 'Relevant educational background',
    ].filter(Boolean) as string[],
    weaknesses: [
      !hasKeywords && 'Missing key technical skills',
      !hasExperience && 'Experience timeline unclear',
      wordCount < 200 && 'Resume too brief',
    ].filter(Boolean) as string[],
    recommendations: [
      'Consider requesting work samples',
      'Verify certifications mentioned',
      'Check LinkedIn profile for consistency',
    ],
  };
}

function getVerdict(score: number): string {
  if (score >= 85) return 'Excellent candidate - Strong match';
  if (score >= 70) return 'Good candidate - Worth interviewing';
  if (score >= 55) return 'Moderate candidate - Review carefully';
  return 'Weak candidate - May not meet requirements';
}
