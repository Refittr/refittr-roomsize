import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const searchParams = request.nextUrl.searchParams
    const streetId = searchParams.get('street_id')

    if (!streetId) {
      return NextResponse.json(
        { error: 'street_id is required' },
        { status: 400 }
      )
    }

    // Get street info
    const { data: streetData, error: streetError } = await supabase
      .from('streets')
      .select('street_name, postcode, postcode_area')
      .eq('id', streetId)
      .single()

    if (streetError) {
      console.error('Street fetch error:', streetError)
    }

    // Get houses linked to this street via house_schema_streets junction table
    const { data: schemaLinks, error: linksError } = await supabase
      .from('house_schema_streets')
      .select(`
        house_schema_id,
        house_schemas (
          id,
          model_name,
          bedrooms,
          property_type,
          exterior_photo_url,
          verified,
          builder_id,
          builders (
            id,
            name
          )
        )
      `)
      .eq('street_id', streetId)

    if (linksError) {
      console.error('Schema links fetch error:', linksError)
      return NextResponse.json({
        error: 'Failed to load house types',
        details: linksError.message,
        houses: [],
        street: streetData || null,
      })
    }

    // Transform results
    const houses = (schemaLinks || [])
      .map((link) => {
        const schema = link.house_schemas as unknown as {
          id: string
          model_name: string
          bedrooms: number
          property_type: string
          exterior_photo_url: string | null
          verified: boolean
          builder_id: string
          builders: { id: string; name: string } | null
        } | null

        if (!schema) return null

        return {
          schema_id: schema.id,
          model_name: schema.model_name,
          builder_name: schema.builders?.name || 'Unknown Builder',
          bedrooms: schema.bedrooms,
          property_type: schema.property_type,
          exterior_photo_url: schema.exterior_photo_url,
          verified: schema.verified,
        }
      })
      .filter(Boolean)
      // Sort: verified first, then by model name
      .sort((a, b) => {
        if (a!.verified !== b!.verified) {
          return a!.verified ? -1 : 1
        }
        return a!.model_name.localeCompare(b!.model_name)
      })

    // Log analytics (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: 'houses_page_view',
        event_data: {
          street_id: streetId,
          street_name: streetData?.street_name,
          houses_count: houses.length,
        },
      })

    return NextResponse.json({
      houses,
      street: streetData || null,
      total: houses.length,
    })
  } catch (error) {
    console.error('Get houses error:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
        houses: [],
        street: null,
      },
      { status: 500 }
    )
  }
}
