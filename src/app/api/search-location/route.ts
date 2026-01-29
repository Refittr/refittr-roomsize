import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // Use server client to bypass RLS for public read operations
  const supabase = createServerClient()

  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    const searchTerm = query.trim().toUpperCase()

    // Search streets by postcode or postcode_area
    const { data: streetResults, error: streetError } = await supabase
      .from('streets')
      .select(`
        id,
        street_name,
        postcode,
        postcode_area,
        development_id,
        developments (
          id,
          name
        )
      `)
      .or(`postcode.ilike.%${searchTerm}%,postcode_area.ilike.%${searchTerm}%`)
      .limit(50)

    if (streetError) {
      console.error('Street search error:', streetError)
      return NextResponse.json({
        error: 'Database error searching streets',
        details: streetError.message,
        results: [],
        total: 0,
      })
    }

    // Search developments by name
    const { data: devResults, error: devError } = await supabase
      .from('developments')
      .select(`
        id,
        name,
        streets (
          id,
          street_name,
          postcode,
          postcode_area
        )
      `)
      .ilike('name', `%${query.trim()}%`)
      .limit(20)

    if (devError) {
      console.error('Development search error:', devError)
    }

    // Combine and deduplicate results
    const resultsMap = new Map()

    // Add street results
    if (streetResults) {
      for (const street of streetResults) {
        const development = street.developments as unknown as { id: string; name: string } | null
        resultsMap.set(street.id, {
          street_id: street.id,
          street_name: street.street_name,
          postcode: street.postcode,
          postcode_area: street.postcode_area,
          development_id: street.development_id,
          development_name: development?.name || null,
        })
      }
    }

    // Add development results (streets within matching developments)
    if (devResults) {
      for (const dev of devResults) {
        const streets = dev.streets as Array<{
          id: string
          street_name: string
          postcode: string
          postcode_area: string
        }> | null

        if (streets) {
          for (const street of streets) {
            if (!resultsMap.has(street.id)) {
              resultsMap.set(street.id, {
                street_id: street.id,
                street_name: street.street_name,
                postcode: street.postcode,
                postcode_area: street.postcode_area,
                development_id: dev.id,
                development_name: dev.name,
              })
            }
          }
        }
      }
    }

    const results = Array.from(resultsMap.values())

    // Group by postcode_area for clean display
    const grouped = results.reduce((acc, item) => {
      const area = item.postcode_area || 'Other'
      if (!acc[area]) {
        acc[area] = []
      }
      acc[area].push(item)
      return acc
    }, {} as Record<string, typeof results>)

    // Log analytics (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: 'postcode_searched',
        event_data: {
          query: searchTerm,
          results_count: results.length,
        },
      })

    return NextResponse.json({
      results,
      grouped,
      total: results.length,
    })
  } catch (error) {
    console.error('Search location error:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        results: [],
        total: 0,
      },
      { status: 500 }
    )
  }
}
