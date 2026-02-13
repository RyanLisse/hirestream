/**
 * CV-Vacancy Matcher
 *
 * Sophisticated matching engine inspired by Dutch recruitment systems.
 * Implements knock-out criteria (hard requirements) and weighted scoring criteria.
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { Job } from '@/lib/data'
import type {
  MatchResult,
  MatchLevel,
  RiskProfile,
  KnockOutCriterion,
  ScoringCriterion,
  KnockOutResult,
  ScoringResult,
} from './types'

const knockOutResultSchema = z.object({
  criterion: z.string(),
  required: z.boolean(),
  met: z.boolean(),
  evidence: z.string(),
})

const scoringResultSchema = z.object({
  criterion: z.string(),
  weight: z.number(),
  score: z.number().min(1).max(5),
  explanation: z.string(),
})

const matchAnalysisSchema = z.object({
  knockOutResults: z.array(knockOutResultSchema),
  scoringResults: z.array(scoringResultSchema),
  summary: z.string(),
  recommendations: z.array(z.string()),
})

interface MatchCandidateToJobOptions {
  resumeText: string
  job: Job
  knockOutCriteria?: KnockOutCriterion[]
  scoringCriteria?: ScoringCriterion[]
}

export async function matchCandidateToJob({
  resumeText,
  job,
  knockOutCriteria,
  scoringCriteria,
}: MatchCandidateToJobOptions): Promise<MatchResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty')
  }

  // Use default criteria if none provided
  const knockOuts = knockOutCriteria || generateDefaultKnockOuts(job)
  const scoring = scoringCriteria || generateDefaultScoring(job)

  try {
    const prompt = buildMatchingPrompt(resumeText, job, knockOuts, scoring)

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: matchAnalysisSchema,
      prompt,
    })

    // Calculate final match result
    return calculateMatchResult(object, knockOuts, scoring)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to match candidate to job: ${error.message}`)
    }
    throw new Error('Failed to match candidate to job: Unknown error')
  }
}

function buildMatchingPrompt(
  resumeText: string,
  job: Job,
  knockOuts: KnockOutCriterion[],
  scoring: ScoringCriterion[]
): string {
  return `You are an expert recruiter analyzing whether a candidate matches a job vacancy.

JOB POSTING:
Title: ${job.title}
Department: ${job.department}
Location: ${job.location}
Type: ${job.type}
Required Skills: ${job.requiredSkills.join(', ')}

CANDIDATE RESUME:
${resumeText}

TASK 1: KNOCK-OUT CRITERIA (Pass/Fail)
Evaluate whether the candidate meets these mandatory requirements. If ANY knock-out criterion is not met, the candidate should be rejected.

${knockOuts.map((ko, i) => `${i + 1}. ${ko.criterion} (Required: ${ko.required})`).join('\n')}

For each knock-out criterion, provide:
- criterion: The criterion text
- required: true/false
- met: Whether the candidate meets this requirement
- evidence: Specific evidence from the resume (or lack thereof)

TASK 2: SCORING CRITERIA (1-5 Stars)
For candidates who pass all knock-outs, evaluate these weighted criteria on a 1-5 scale:
- 1 star: Poor/absent
- 2 stars: Below average
- 3 stars: Average/acceptable
- 4 stars: Good/strong
- 5 stars: Excellent/exceptional

${scoring.map((sc, i) => `${i + 1}. ${sc.criterion} (Weight: ${sc.weight})`).join('\n')}

For each scoring criterion, provide:
- criterion: The criterion text
- weight: The weight value
- score: Your 1-5 rating
- explanation: Justification for the score with specific evidence

TASK 3: OVERALL ASSESSMENT
Provide:
- summary: 2-3 sentence overall assessment
- recommendations: 3-5 actionable recommendations for next steps (interview, specific questions to ask, concerns to address, etc.)`
}

function generateDefaultKnockOuts(job: Job): KnockOutCriterion[] {
  const knockOuts: KnockOutCriterion[] = [
    {
      id: 'location',
      criterion: `Able to work in ${job.location} or relocate`,
      required: true,
    },
    {
      id: 'availability',
      criterion: `Available for ${job.type} employment`,
      required: true,
    },
  ]

  // Add skill-based knock-outs for critical skills
  if (job.requiredSkills && job.requiredSkills.length > 0) {
    const topSkills = job.requiredSkills.slice(0, 2) // First 2 are most critical
    topSkills.forEach((skill, index) => {
      knockOuts.push({
        id: `skill-${index}`,
        criterion: `Has professional experience with ${skill}`,
        required: true,
      })
    })
  }

  return knockOuts
}

function generateDefaultScoring(job: Job): ScoringCriterion[] {
  return [
    {
      id: 'technical-skills',
      criterion: 'Technical skills depth and breadth',
      weight: 30,
    },
    {
      id: 'relevant-experience',
      criterion: 'Relevant experience in similar roles',
      weight: 25,
    },
    {
      id: 'education',
      criterion: 'Educational background and certifications',
      weight: 15,
    },
    {
      id: 'career-progression',
      criterion: 'Career progression and growth trajectory',
      weight: 15,
    },
    {
      id: 'cultural-fit',
      criterion: 'Potential cultural fit based on work history',
      weight: 10,
    },
    {
      id: 'communication',
      criterion: 'Communication skills (based on resume quality)',
      weight: 5,
    },
  ]
}

function calculateMatchResult(
  analysis: {
    knockOutResults: KnockOutResult[]
    scoringResults: ScoringResult[]
    summary: string
    recommendations: string[]
  },
  knockOuts: KnockOutCriterion[],
  scoring: ScoringCriterion[]
): MatchResult {
  // Check if all required knock-outs passed
  const requiredKnockOuts = analysis.knockOutResults.filter((ko) => ko.required)
  const knockOutsPassed = requiredKnockOuts.every((ko) => ko.met)

  // Calculate total weighted score
  const totalWeight = scoring.reduce((sum, sc) => sum + sc.weight, 0)
  const weightedSum = analysis.scoringResults.reduce(
    (sum, sr) => sum + sr.score * sr.weight,
    0
  )
  const totalWeightedScore = totalWeight > 0 ? (weightedSum / totalWeight) * 20 : 0 // Convert to 0-100 scale

  // Determine overall match level
  let overallMatch: MatchLevel
  if (!knockOutsPassed) {
    overallMatch = 'rejected'
  } else if (totalWeightedScore >= 80) {
    overallMatch = 'excellent'
  } else if (totalWeightedScore >= 70) {
    overallMatch = 'strong'
  } else if (totalWeightedScore >= 60) {
    overallMatch = 'good'
  } else {
    overallMatch = 'weak'
  }

  // Determine risk profile
  const riskProfile = calculateRiskProfile(analysis, totalWeightedScore, knockOutsPassed)

  return {
    overallMatch,
    knockOutsPassed,
    knockOutResults: analysis.knockOutResults,
    scoringResults: analysis.scoringResults,
    totalWeightedScore,
    summary: analysis.summary,
    riskProfile,
    recommendations: analysis.recommendations,
  }
}

function calculateRiskProfile(
  analysis: {
    knockOutResults: KnockOutResult[]
    scoringResults: ScoringResult[]
  },
  totalWeightedScore: number,
  knockOutsPassed: boolean
): RiskProfile {
  if (!knockOutsPassed) {
    return 'high'
  }

  // Count low scores (1-2 stars) in critical categories
  const lowScores = analysis.scoringResults.filter((sr) => sr.score <= 2 && sr.weight >= 20)

  // Count borderline knock-outs (passed but with weak evidence)
  const weakKnockOuts = analysis.knockOutResults.filter(
    (ko) => ko.met && ko.evidence.length < 50
  )

  if (totalWeightedScore >= 75 && lowScores.length === 0 && weakKnockOuts.length === 0) {
    return 'low'
  } else if (lowScores.length >= 2 || weakKnockOuts.length >= 2 || totalWeightedScore < 60) {
    return 'high'
  } else {
    return 'medium'
  }
}
