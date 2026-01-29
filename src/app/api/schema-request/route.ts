import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { postcode, street_name, development_name, reason, email } = body

    if (!postcode || postcode.trim().length < 3) {
      return NextResponse.json(
        { error: 'Postcode is required' },
        { status: 400 }
      )
    }

    // Insert schema request
    const { error: insertError } = await supabase
      .from('schema_requests')
      .insert({
        postcode: postcode.trim().toUpperCase(),
        house_type: street_name || 'Not specified',
        builder_name: 'Unknown',
        development_name: development_name || null,
        additional_info: reason || null,
        user_email: email || null,
        status: 'pending',
      })

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
        event_type: 'schema_requested',
        event_data: {
          postcode: postcode.trim().toUpperCase(),
          has_street_name: !!street_name,
          has_development_name: !!development_name,
          reason,
        },
      })

    return NextResponse.json({
      success: true,
      message: "Thanks! We'll add this schema soon and notify you.",
    })
  } catch (error) {
    console.error('Schema request error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
