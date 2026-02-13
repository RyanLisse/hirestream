/**
 * API Route: CV-Vacancy Matcher
 *
 * POST endpoint to match a candidate's resume against a job posting
 */

import { NextRequest, NextResponse } from 'next/server'
import { matchCandidateToJob, parseResume } from '@/lib/ai'
import type { KnockOutCriterion, ScoringCriterion } from '@/lib/ai'
import type { Job } from '@/lib/data'

interface MatchRequestBody {
  // Option 1: Use IDs to fetch from database
  candidateId?: string
  jobId?: string

  // Option 2: Direct data
  resumeText?: string
  resumeFile?: string // Base64 encoded
  job?: Job

  // Optional custom criteria
  knockOutCriteria?: KnockOutCriterion[]
  scoringCriteria?: ScoringCriterion[]
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')

    let body: MatchRequestBody
    let resumeText: string | undefined
    let job: Job | undefined

    // Handle multipart form data (file upload)
    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('resume') as File | null
      const jobData = formData.get('job') as string | null
      const knockOutCriteriaData = formData.get('knockOutCriteria') as string | null
      const scoringCriteriaData = formData.get('scoringCriteria') as string | null

      if (!file || !jobData) {
        return NextResponse.json(
          { error: 'Missing required fields: resume and job' },
          { status: 400 }
        )
      }

      // Parse resume
      const buffer = Buffer.from(await file.arrayBuffer())
      resumeText = await parseResume(buffer, file.type)

      // Parse job data
      job = JSON.parse(jobData)

      // Parse optional criteria
      body = {
        resumeText,
        job,
        knockOutCriteria: knockOutCriteriaData ? JSON.parse(knockOutCriteriaData) : undefined,
        scoringCriteria: scoringCriteriaData ? JSON.parse(scoringCriteriaData) : undefined,
      }
    } else {
      // Handle JSON body
      body = await request.json()
    }

    // Validate we have either IDs or direct data
    if (body.candidateId && body.jobId) {
      // TODO: Fetch from database when implemented
      return NextResponse.json(
        { error: 'Database integration not yet implemented. Please provide resumeText and job directly.' },
        { status: 501 }
      )
    }

    if (!resumeText && !body.resumeText) {
      return NextResponse.json(
        { error: 'No resume text provided' },
        { status: 400 }
      )
    }

    if (!job && !body.job) {
      return NextResponse.json(
        { error: 'No job data provided' },
        { status: 400 }
      )
    }

    const finalResumeText = resumeText || body.resumeText!
    const finalJob = job || body.job!

    // Perform the match
    const matchResult = await matchCandidateToJob({
      resumeText: finalResumeText,
      job: finalJob,
      knockOutCriteria: body.knockOutCriteria,
      scoringCriteria: body.scoringCriteria,
    })

    return NextResponse.json({
      success: true,
      data: matchResult,
    })
  } catch (error) {
    console.error('Error matching candidate:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      { error: `Failed to match candidate: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST to this endpoint to match a candidate against a job',
    usage: {
      method: 'POST',
      contentType: 'application/json or multipart/form-data',
      jsonExample: {
        resumeText: 'Full resume text...',
        job: {
          id: 'j1',
          title: 'Senior Frontend Engineer',
          department: 'Engineering',
          location: 'San Francisco, CA',
          type: 'Full-time',
          requiredSkills: ['React', 'TypeScript', 'Next.js'],
        },
        knockOutCriteria: [
          { id: 'location', criterion: 'Can work in San Francisco', required: true },
        ],
        scoringCriteria: [
          { id: 'skills', criterion: 'Technical skills', weight: 30 },
        ],
      },
      formDataExample: {
        resume: 'File (PDF or TXT)',
        job: 'JSON string of job object',
        knockOutCriteria: 'JSON string (optional)',
        scoringCriteria: 'JSON string (optional)',
      },
    },
  })
}
