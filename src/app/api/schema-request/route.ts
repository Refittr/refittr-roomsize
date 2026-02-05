import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { postcode, street_name, development_name, reason, email, schema_id, model_name, builder_name: reqBuilderName, source } = body

    if (!postcode || postcode.trim().length < 3) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      )
    }

    // Build the insert data
    const isHouseSearch = source === 'house_search'
    const insertData: Record<string, unknown> = {
      postcode: postcode.trim().toUpperCase(),
      house_type: isHouseSearch ? (model_name || 'Not specified') : (street_name || 'Not specified'),
      builder_name: reqBuilderName || 'Unknown',
      development_name: development_name || null,
      additional_info: isHouseSearch
        ? `[House search] User searched for house type and provided postcode. Schema ID: ${schema_id || 'N/A'}. ${reason || ''}`
        : (reason || null),
      user_email: email || null,
      status: 'pending',
    }

    // Insert schema request
    const { error: insertError } = await supabase
      .from('schema_requests')
      .insert(insertData)

    if (insertError) {
      console.error('Schema request insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit request. Please try again.' },
        { status: 500 }
      )
    }

    // Log analytics (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: isHouseSearch ? 'house_search_postcode_submitted' : 'schema_requested',
        event_data: {
          postcode: postcode.trim().toUpperCase(),
          has_street_name: !!street_name,
          has_development_name: !!development_name,
          reason,
          schema_id: schema_id || null,
          model_name: model_name || null,
          source: source || 'manual_request',
        },
      })

    return NextResponse.json({
      success: true,
      schema_id: schema_id || null,
      message: isHouseSearch
        ? "Thanks! We've noted your postcode. You can now view your room dimensions."
        : "Thanks! We'll add this schema soon and notify you.",
    })
  } catch (error) {
    console.error('Schema request error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
