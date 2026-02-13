import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const jobId = searchParams.get('job_id')
    const candidateId = searchParams.get('candidate_id')
    const status = searchParams.get('status')
    const stage = searchParams.get('stage')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Build query with joins
    let query = supabase
      .from('applications')
      .select(`
        *,
        candidate:candidates(*),
        job:jobs(*)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (jobId) {
      query = query.eq('job_id', jobId)
    }

    if (candidateId) {
      query = query.eq('candidate_id', candidateId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    if (stage) {
      query = query.eq('stage', stage)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.candidate_id || !body.job_id) {
      return NextResponse.json(
        { error: 'candidate_id and job_id are required' },
        { status: 400 }
      )
    }

    // Check if candidate and job exist
    const { data: candidate } = await supabase
      .from('candidates')
      .select('id')
      .eq('id', body.candidate_id)
      .single()

    const { data: job } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', body.job_id)
      .single()

    if (!candidate || !job) {
      return NextResponse.json(
        { error: 'Candidate or job not found' },
        { status: 404 }
      )
    }

    // Check for existing application
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', body.candidate_id)
      .eq('job_id', body.job_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Application already exists for this candidate and job' },
        { status: 409 }
      )
    }

    // Insert new application
    const { data, error } = await supabase
      .from('applications')
      .insert({
        candidate_id: body.candidate_id,
        job_id: body.job_id,
        status: body.status || null,
        stage: body.stage || null,
        ai_match_score: body.ai_match_score || null,
        knock_out_results: body.knock_out_results || null,
        scoring_results: body.scoring_results || null,
        notes: body.notes || null
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Update application
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: body.status,
        stage: body.stage,
        ai_match_score: body.ai_match_score,
        knock_out_results: body.knock_out_results,
        scoring_results: body.scoring_results,
        notes: body.notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
