import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const supabase = createServerClient()

  try {
    const body = await request.json()
    const { email, source = 'roomsize_footer', page_path } = body

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('mailing_list')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'This email is already on the waitlist' },
        { status: 409 }
      )
    }

    // Insert into mailing_list
    const { error: insertError } = await supabase
      .from('mailing_list')
      .insert({
        email: email.toLowerCase(),
        source,
      })

    if (insertError) {
      console.error('Failed to insert email:', insertError)
      return NextResponse.json(
        { error: 'Failed to join waitlist. Please try again.' },
        { status: 500 }
      )
    }

    // Log analytics event (fire and forget)
    void supabase
      .from('analytics_events')
      .insert({
        event_type: 'waitlist_signup',
        event_data: {
          source,
          page_path,
        },
        page_url: page_path,
        user_agent: request.headers.get('user-agent') || null,
      })

    return NextResponse.json(
      { success: true, message: 'Successfully joined the waitlist' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Waitlist signup error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
