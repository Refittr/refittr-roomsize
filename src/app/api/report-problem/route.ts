import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { schema_id, builder_name, house_type, room_name, problem_description, email } = body

    if (!problem_description || problem_description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a detailed description of the problem (at least 10 characters)' },
        { status: 400 }
      )
    }

    // Insert problem report
    const { error: insertError } = await supabase
      .from('schema_problem_reports')
      .insert({
        schema_id: schema_id || null,
        builder_name: builder_name || 'Unknown',
        house_type: house_type || 'Unknown',
        problem_description: `${room_name ? `Room: ${room_name}\n\n` : ''}${problem_description.trim()}`,
        user_email: email || null,
        status: 'open',
      })

    if (insertError) {
      console.error('Problem report insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to submit report. Please try again.' },
        { status: 500 }
      )
    }

    // Log analytics (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: 'problem_reported',
        event_data: {
          schema_id,
          builder_name,
          house_type,
          room_name,
          has_email: !!email,
        },
      })

    return NextResponse.json({
      success: true,
      message: "Thanks for reporting. We'll investigate and get back to you.",
    })
  } catch (error) {
    console.error('Report problem error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
