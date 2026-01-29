import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const searchParams = request.nextUrl.searchParams
    const schemaId = searchParams.get('schema_id')

    if (!schemaId) {
      return NextResponse.json(
        { error: 'schema_id is required' },
        { status: 400 }
      )
    }

    // Get schema with builder info
    const { data: schema, error: schemaError } = await supabase
      .from('house_schemas')
      .select(`
        id,
        model_name,
        bedrooms,
        property_type,
        year_from,
        year_to,
        floor_plan_url,
        exterior_photo_url,
        verified,
        notes,
        builder_id,
        builders (
          id,
          name
        )
      `)
      .eq('id', schemaId)
      .single()

    if (schemaError) {
      console.error('Schema fetch error:', schemaError)
      return NextResponse.json({
        error: 'Schema not found',
        details: schemaError.message,
      }, { status: 404 })
    }

    // Get rooms for this schema
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        id,
        room_name,
        room_type,
        floor_level,
        length_cm,
        width_cm,
        height_cm,
        floor_area_sqm,
        notes,
        dimensions_need_verification,
        verification_reason
      `)
      .eq('house_schema_id', schemaId)
      .order('floor_level', { ascending: true })
      .order('room_name', { ascending: true })

    if (roomsError) {
      console.error('Rooms fetch error:', roomsError)
    }

    // Transform builder data
    const builder = schema.builders as unknown as { id: string; name: string } | null

    // Log analytics (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: 'schema_page_view',
        event_data: {
          schema_id: schemaId,
          model_name: schema.model_name,
          builder_name: builder?.name,
          rooms_count: rooms?.length || 0,
        },
      })

    return NextResponse.json({
      schema: {
        id: schema.id,
        model_name: schema.model_name,
        builder_name: builder?.name || 'Unknown Builder',
        builder_id: schema.builder_id,
        bedrooms: schema.bedrooms,
        property_type: schema.property_type,
        year_from: schema.year_from,
        year_to: schema.year_to,
        floor_plan_url: schema.floor_plan_url,
        exterior_photo_url: schema.exterior_photo_url,
        verified: schema.verified,
        notes: schema.notes,
      },
      rooms: rooms || [],
    })
  } catch (error) {
    console.error('Get schema error:', error)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
