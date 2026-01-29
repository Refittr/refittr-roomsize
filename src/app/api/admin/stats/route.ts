import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ADMIN_KEY = process.env.ADMIN_KEY || 'roomsize-admin-2024'

interface AnalyticsEvent {
  id: string
  event_type: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  event_data: any
  page_url: string | null
  created_at: string
}

export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  // Check authorization
  const authKey = request.nextUrl.searchParams.get('key')
  if (authKey !== ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get date filter
  const dateFilter = request.nextUrl.searchParams.get('period') || '7d'
  let startDate: Date

  switch (dateFilter) {
    case '7d':
      startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      break
    default:
      startDate = new Date('2020-01-01')
  }

  try {
    // Fetch all analytics events in date range
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    if (eventsError) {
      console.error('Events fetch error:', eventsError)
    }

    // Fetch schema requests
    const { data: schemaRequests, error: schemaRequestsError } = await supabase
      .from('schema_requests')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (schemaRequestsError) {
      console.error('Schema requests fetch error:', schemaRequestsError)
    }

    // Fetch problem reports
    const { data: problemReports, error: problemReportsError } = await supabase
      .from('schema_problem_reports')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (problemReportsError) {
      console.error('Problem reports fetch error:', problemReportsError)
    }

    // Fetch waitlist signups
    const { data: waitlist, error: waitlistError } = await supabase
      .from('waitlist_signups')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(50)

    if (waitlistError) {
      console.error('Waitlist fetch error:', waitlistError)
    }

    // Calculate stats
    const allEvents = (events || []) as AnalyticsEvent[]

    // Count by event type
    const searchEvents = allEvents.filter(e => e.event_type === 'search')
    const pageViews = allEvents.filter(e => e.event_type === 'page_view')
    const roomViews = allEvents.filter(e => e.event_type === 'room_expanded')
    const schemaPageViews = allEvents.filter(e => e.event_type === 'schema_page_view')

    // Unique postcodes searched
    const uniquePostcodes = new Set(
      searchEvents
        .map(e => e.event_data?.query?.toUpperCase?.())
        .filter(Boolean)
    )

    // Top postcodes
    const postcodeCount: Record<string, number> = {}
    searchEvents.forEach(e => {
      const query = e.event_data?.query?.toUpperCase?.()
      if (query) {
        postcodeCount[query] = (postcodeCount[query] || 0) + 1
      }
    })
    const topPostcodes = Object.entries(postcodeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([postcode, count]) => ({ postcode, count }))

    // Top house types viewed
    const houseTypeCount: Record<string, number> = {}
    schemaPageViews.forEach(e => {
      const modelName = e.event_data?.model_name
      if (modelName) {
        houseTypeCount[modelName] = (houseTypeCount[modelName] || 0) + 1
      }
    })
    const topHouseTypes = Object.entries(houseTypeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([model, count]) => ({ model, count }))

    // Top rooms viewed
    const roomCount: Record<string, number> = {}
    roomViews.forEach(e => {
      const roomName = e.event_data?.room_name
      if (roomName) {
        roomCount[roomName] = (roomCount[roomName] || 0) + 1
      }
    })
    const topRooms = Object.entries(roomCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([room, count]) => ({ room, count }))

    // Reasons submitted
    const reasonEvents = allEvents.filter(e => e.event_type === 'reason_submitted')
    const reasonCount: Record<string, number> = {}
    reasonEvents.forEach(e => {
      const reason = e.event_data?.reason
      if (reason) {
        reasonCount[reason] = (reasonCount[reason] || 0) + 1
      }
    })
    const topReasons = Object.entries(reasonCount)
      .sort((a, b) => b[1] - a[1])
      .map(([reason, count]) => ({ reason, count }))

    return NextResponse.json({
      stats: {
        totalSearches: searchEvents.length,
        uniquePostcodes: uniquePostcodes.size,
        totalPageViews: pageViews.length,
        totalSchemaViews: schemaPageViews.length,
        totalRoomViews: roomViews.length,
        waitlistSignups: (waitlist || []).length,
        schemaRequestsCount: (schemaRequests || []).length,
        problemReportsCount: (problemReports || []).length,
      },
      schemaRequests: schemaRequests || [],
      problemReports: problemReports || [],
      waitlist: waitlist || [],
      topPostcodes,
      topHouseTypes,
      topRooms,
      topReasons,
      period: dateFilter,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
