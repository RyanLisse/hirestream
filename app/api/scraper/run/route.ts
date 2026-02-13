import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Validate required fields
    if (!body.config_id) {
      return NextResponse.json(
        { error: 'config_id is required' },
        { status: 400 }
      )
    }

    // Fetch scrape config
    const { data: config, error: configError } = await supabase
      .from('scrape_configs')
      .select('*')
      .eq('id', body.config_id)
      .single()

    if (configError || !config) {
      return NextResponse.json(
        { error: 'Scrape config not found' },
        { status: 404 }
      )
    }

    if (!config.active) {
      return NextResponse.json(
        { error: 'Scrape config is not active' },
        { status: 400 }
      )
    }

    // Update last_run timestamp
    await supabase
      .from('scrape_configs')
      .update({ last_run: new Date().toISOString() })
      .eq('id', body.config_id)

    // This is where you would implement the actual scraping logic
    // For now, we'll return a success response with the config
    // In production, you would:
    // 1. Use a job queue (e.g., BullMQ, Inngest)
    // 2. Implement the scraper logic in a separate service
    // 3. Parse the scraped data and insert jobs into the database

    return NextResponse.json({
      message: 'Scrape job initiated',
      config: {
        id: config.id,
        platform: config.platform,
        base_url: config.base_url,
        search_query: config.search_query
      },
      status: 'queued',
      note: 'Implement actual scraper logic in production'
    })
  } catch (error) {
    console.error('Error running scraper:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
