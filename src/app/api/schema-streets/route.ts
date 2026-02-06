import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const { searchParams } = new URL(request.url)
    const schemaId = searchParams.get('schema_id')

    if (!schemaId) {
      return NextResponse.json(
        { error: 'schema_id is required' },
        { status: 400 }
      )
    }

    // Fetch streets linked to this schema via the junction table
    const { data, error } = await supabase
      .from('house_schema_streets')
      .select(`
        street_id,
        streets (
          id,
          street_name,
          postcode,
          postcode_area,
          development_id,
          developments (
            id,
            name
          )
        )
      `)
      .eq('house_schema_id', schemaId)

    if (error) throw error

    // Flatten and format the response
    const streets = (data || []).map((item: any) => ({
      street_id: item.street_id,
      street_name: item.streets?.street_name || '',
      postcode: item.streets?.postcode || null,
      postcode_area: item.streets?.postcode_area || '',
      development_id: item.streets?.development_id || null,
      development_name: item.streets?.developments?.name || null,
    }))

    return NextResponse.json({ streets })
  } catch (error) {
    console.error('Error fetching schema streets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch streets' },
      { status: 500 }
    )
  }
}
