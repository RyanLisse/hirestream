/**
 * AI Resume Grader
 *
 * Uses Claude via Vercel AI SDK to grade resumes with structured output
 */

import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { ResumeGrade } from './types'

const resumeGradeSchema = z.object({
  overallScore: z.number().min(0).max(100),
  skillMatch: z.number().min(0).max(100),
  relevance: z.number().min(0).max(100),
  resumeQuality: z.number().min(0).max(100),
  aiContentScore: z.number().min(0).max(100),
  skills: z.array(z.string()),
  experienceYears: z.number(),
  education: z.string(),
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
})

export async function gradeResume(
  resumeText: string,
  jobDescription?: string
): Promise<ResumeGrade> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  if (!resumeText || resumeText.trim().length === 0) {
    throw new Error('Resume text cannot be empty')
  }

  try {
    const prompt = jobDescription
      ? buildPromptWithJob(resumeText, jobDescription)
      : buildPromptWithoutJob(resumeText)

    const { object } = await generateObject({
      model: anthropic('claude-3-5-sonnet-20241022'),
      schema: resumeGradeSchema,
      prompt,
    })

    return object as ResumeGrade
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to grade resume: ${error.message}`)
    }
    throw new Error('Failed to grade resume: Unknown error')
  }
}

function buildPromptWithJob(resumeText: string, jobDescription: string): string {
  return `You are an expert technical recruiter. Analyze this resume and grade it against the job description.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

Provide a comprehensive analysis with the following scores (0-100):

1. **overallScore**: Overall quality and fit for this specific job
2. **skillMatch**: How well the candidate's skills match the job requirements
3. **relevance**: How relevant the candidate's experience is to this role
4. **resumeQuality**: Technical quality of the resume (clarity, structure, professionalism)
5. **aiContentScore**: Likelihood this resume was AI-generated (0 = definitely human, 100 = definitely AI)

Also extract:
- **skills**: All technical and relevant skills mentioned
- **experienceYears**: Total years of professional experience
- **education**: Highest level of education and degree(s)
- **summary**: 2-3 sentence summary of the candidate
- **strengths**: 3-5 key strengths relative to the job
- **weaknesses**: 2-4 potential concerns or gaps relative to the job`
}

function buildPromptWithoutJob(resumeText: string): string {
  return `You are an expert technical recruiter. Analyze this resume and provide a comprehensive grade.

RESUME:
${resumeText}

Provide a comprehensive analysis with the following scores (0-100):

1. **overallScore**: Overall quality as a professional resume
2. **skillMatch**: Breadth and depth of technical skills (score based on skill diversity and seniority)
3. **relevance**: Career progression and coherence (is the career path logical and progressive?)
4. **resumeQuality**: Technical quality of the resume (clarity, structure, professionalism)
5. **aiContentScore**: Likelihood this resume was AI-generated (0 = definitely human, 100 = definitely AI)

Also extract:
- **skills**: All technical and relevant skills mentioned
- **experienceYears**: Total years of professional experience
- **education**: Highest level of education and degree(s)
- **summary**: 2-3 sentence summary of the candidate
- **strengths**: 3-5 key strengths of this candidate
- **weaknesses**: 2-4 potential concerns or areas for improvement`
}
