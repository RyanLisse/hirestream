/**
 * API Route: Grade Resume
 *
 * POST endpoint to parse and grade a resume file
 */

import { NextRequest, NextResponse } from 'next/server'
import { parseResume, gradeResume } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('resume') as File | null
    const jobDescription = formData.get('jobDescription') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No resume file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const mimeType = file.type
    if (mimeType !== 'application/pdf' && mimeType !== 'text/plain') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and plain text files are supported.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Parse the resume
    const buffer = Buffer.from(await file.arrayBuffer())
    const resumeText = await parseResume(buffer, mimeType)

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from resume' },
        { status: 400 }
      )
    }

    // Grade the resume
    const grade = await gradeResume(
      resumeText,
      jobDescription || undefined
    )

    return NextResponse.json({
      success: true,
      data: {
        resumeText: resumeText.substring(0, 500) + '...', // Return preview
        grade,
      },
    })
  } catch (error) {
    console.error('Error grading resume:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      { error: `Failed to grade resume: ${errorMessage}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'POST a resume file to this endpoint for AI grading',
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        resume: 'File (PDF or TXT, max 10MB)',
        jobDescription: 'String (optional)',
      },
    },
  })
}
