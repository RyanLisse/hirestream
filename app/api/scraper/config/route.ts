import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const platform = searchParams.get('platform')
    const active = searchParams.get('active')

    // Build query
    let query = supabase
      .from('scrape_configs')
      .select('*')
      .order('platform', { ascending: true })

    // Apply filters
    if (platform) {
      query = query.eq('platform', platform)
    }

    if (active !== null) {
      query = query.eq('active', active === 'true')
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching scrape configs:', error)
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
    if (!body.platform || !body.base_url) {
      return NextResponse.json(
        { error: 'platform and base_url are required' },
        { status: 400 }
      )
    }

    // Insert new scrape config
    const { data, error } = await supabase
      .from('scrape_configs')
      .insert({
        platform: body.platform,
        base_url: body.base_url,
        search_query: body.search_query || null,
        selectors: body.selectors || null,
        schedule: body.schedule || null,
        active: body.active ?? true
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
    console.error('Error creating scrape config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
