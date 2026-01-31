'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Flag } from 'lucide-react'
import ProblemReportModal from '@/components/ProblemReportModal'
import { RoomsPageSkeleton } from '@/components/LoadingSkeleton'

interface Room {
  id: string
  room_name: string
  room_type: string
  floor_level: number
  length_cm: number
  width_cm: number
  height_cm: number
  floor_area_sqm: number
  notes: string | null
  dimensions_need_verification: boolean | null
  verification_reason: string | null
}

interface Schema {
  id: string
  model_name: string
  builder_name: string
  builder_id: string
  bedrooms: number
  property_type: string
  year_from: number | null
  year_to: number | null
  floor_plan_url: string | null
  exterior_photo_url: string | null
  verified: boolean
  notes: string | null
}

const REASONS = [
  { value: 'renovation', label: 'Planning renovation' },
  { value: 'flooring', label: 'Buying flooring/carpet' },
  { value: 'viewing', label: 'Viewing properties' },
  { value: 'furniture', label: 'Buying furniture' },
  { value: 'curious', label: 'Just curious' },
  { value: 'other', label: 'Other' },
]

const FLOOR_LABELS: Record<number, string> = {
  0: 'Ground Floor',
  1: 'First Floor',
  2: 'Second Floor',
  3: 'Third Floor',
}

const ROOM_TYPE_COLORS: Record<string, { badgeBg: string; badgeText: string; border: string }> = {
  // Kitchen - Orange
  kitchen: { badgeBg: '#FFEDD5', badgeText: '#C2410C', border: '#FB923C' },
  'kitchen/dining': { badgeBg: '#FFEDD5', badgeText: '#C2410C', border: '#FB923C' },
  // Bedrooms - Blue
  bedroom: { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  'master bedroom': { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  'bedroom 1': { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  'bedroom 2': { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  'bedroom 3': { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  'bedroom 4': { badgeBg: '#DBEAFE', badgeText: '#1D4ED8', border: '#60A5FA' },
  // Bathrooms - Cyan
  bathroom: { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  'en-suite': { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  ensuite: { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  'en suite': { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  wc: { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  toilet: { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  cloakroom: { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  'shower room': { badgeBg: '#CFFAFE', badgeText: '#0E7490', border: '#22D3EE' },
  // Living areas - Green
  'living room': { badgeBg: '#DCFCE7', badgeText: '#15803D', border: '#4ADE80' },
  living: { badgeBg: '#DCFCE7', badgeText: '#15803D', border: '#4ADE80' },
  lounge: { badgeBg: '#DCFCE7', badgeText: '#15803D', border: '#4ADE80' },
  // Dining - Amber/Yellow
  dining: { badgeBg: '#FEF3C7', badgeText: '#B45309', border: '#FBBF24' },
  'dining room': { badgeBg: '#FEF3C7', badgeText: '#B45309', border: '#FBBF24' },
  // Hallways - Teal
  hallway: { badgeBg: '#CCFBF1', badgeText: '#0F766E', border: '#2DD4BF' },
  hall: { badgeBg: '#CCFBF1', badgeText: '#0F766E', border: '#2DD4BF' },
  landing: { badgeBg: '#CCFBF1', badgeText: '#0F766E', border: '#2DD4BF' },
  entrance: { badgeBg: '#CCFBF1', badgeText: '#0F766E', border: '#2DD4BF' },
  porch: { badgeBg: '#CCFBF1', badgeText: '#0F766E', border: '#2DD4BF' },
  // Utility - Purple
  utility: { badgeBg: '#F3E8FF', badgeText: '#7E22CE', border: '#A855F7' },
  'utility room': { badgeBg: '#F3E8FF', badgeText: '#7E22CE', border: '#A855F7' },
  laundry: { badgeBg: '#F3E8FF', badgeText: '#7E22CE', border: '#A855F7' },
  // Garage - Rose/Pink
  garage: { badgeBg: '#FFE4E6', badgeText: '#BE123C', border: '#FB7185' },
  // Study/Office - Indigo
  study: { badgeBg: '#E0E7FF', badgeText: '#4338CA', border: '#818CF8' },
  office: { badgeBg: '#E0E7FF', badgeText: '#4338CA', border: '#818CF8' },
  'home office': { badgeBg: '#E0E7FF', badgeText: '#4338CA', border: '#818CF8' },
  // Storage - Violet
  storage: { badgeBg: '#EDE9FE', badgeText: '#6D28D9', border: '#8B5CF6' },
  cupboard: { badgeBg: '#EDE9FE', badgeText: '#6D28D9', border: '#8B5CF6' },
  wardrobe: { badgeBg: '#EDE9FE', badgeText: '#6D28D9', border: '#8B5CF6' },
  // Conservatory - Lime
  conservatory: { badgeBg: '#ECFCCB', badgeText: '#4D7C0F', border: '#84CC16' },
}

function RoomsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schemaId = searchParams.get('schema_id')

  const [schema, setSchema] = useState<Schema | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null)
  const [selectedReason, setSelectedReason] = useState('')
  const [isSubmittingReason, setIsSubmittingReason] = useState(false)
  const [reasonSubmitted, setReasonSubmitted] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportRoomName, setReportRoomName] = useState<string | undefined>()
  const [ceilingHeight, setCeilingHeight] = useState(2.4)
  const [hoveredWall, setHoveredWall] = useState<number | null>(null)

  useEffect(() => {
    if (!schemaId) {
      router.push('/')
      return
    }

    const fetchSchema = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/get-schema?schema_id=${encodeURIComponent(schemaId)}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load schema')
          return
        }

        setSchema(data.schema)
        setRooms(data.rooms || [])
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchema()
  }, [schemaId, router])

  const handleRoomClick = (room: Room, event: React.MouseEvent<HTMLButtonElement>) => {
    // Toggle expansion
    if (expandedRoom === room.id) {
      setExpandedRoom(null)
    } else {
      setExpandedRoom(room.id)

      // Scroll the clicked room into view after expansion
      setTimeout(() => {
        const button = event.currentTarget
        const roomElement = button.closest('[data-room-id]')
        if (roomElement) {
          roomElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 50)

      // Log analytics
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'room_viewed',
          event_data: {
            schema_id: schemaId,
            room_id: room.id,
            room_name: room.room_name,
            room_type: room.room_type,
          },
          page_url: '/rooms',
        }),
      }).catch(() => {})
    }
  }

  const handleReasonChange = (reason: string) => {
    setSelectedReason(reason)
    setReasonSubmitted(false)
  }

  const handleReasonSubmit = async () => {
    if (!selectedReason) return

    setIsSubmittingReason(true)

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'reason_submitted',
          event_data: {
            schema_id: schemaId,
            model_name: schema?.model_name,
            builder_name: schema?.builder_name,
            reason: selectedReason,
          },
          page_url: '/rooms',
        }),
      })
      setReasonSubmitted(true)
    } catch {
      // Silently fail
    } finally {
      setIsSubmittingReason(false)
    }
  }

  const handleReportProblem = (roomName?: string) => {
    setReportRoomName(roomName)
    setShowReportModal(true)
  }

  const formatDimension = (cm: number): string => {
    return (cm / 100).toFixed(2)
  }

  const calculateArea = (lengthCm: number, widthCm: number): string => {
    const area = (lengthCm / 100) * (widthCm / 100)
    return area.toFixed(2)
  }

  const getRoomTypeColor = (roomType: string): { badgeBg: string; badgeText: string; border: string } => {
    const type = roomType.toLowerCase()
    return ROOM_TYPE_COLORS[type] || { badgeBg: '#F3F4F6', badgeText: '#374151', border: '#9CA3AF' }
  }

  const calculateWallArea = (wallLengthCm: number): number => {
    return (wallLengthCm / 100) * ceilingHeight
  }

  const getWallDimensions = (room: Room) => {
    const lengthM = room.length_cm / 100
    const widthM = room.width_cm / 100
    const wall1Area = calculateWallArea(room.length_cm)
    const wall2Area = calculateWallArea(room.width_cm)
    const totalWallArea = (wall1Area * 2) + (wall2Area * 2)

    return {
      walls: [
        { name: 'Wall 1 (Length)', length: lengthM, area: wall1Area },
        { name: 'Wall 2 (Width)', length: widthM, area: wall2Area },
        { name: 'Wall 3 (Length)', length: lengthM, area: wall1Area },
        { name: 'Wall 4 (Width)', length: widthM, area: wall2Area },
      ],
      totalArea: totalWallArea,
    }
  }

  // Group rooms by floor
  const roomsByFloor = rooms.reduce((acc, room) => {
    const floor = room.floor_level
    if (!acc[floor]) {
      acc[floor] = []
    }
    acc[floor].push(room)
    return acc
  }, {} as Record<number, Room[]>)

  return (
    <>
      <div className="flex-1 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#64748B] hover:text-[#0F172A] text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to houses
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E2E8F0] border-t-[#10B981] rounded-full animate-spin"></div>
              <p className="text-[#64748B] mt-4">Loading room dimensions...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.back()}
                className="text-[#10B981] hover:text-[#059669] font-medium"
              >
                Go back
              </button>
            </div>
          )}

          {/* Schema Found */}
          {!isLoading && !error && schema && (
            <>
              {/* Success Banner */}
              <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4 mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-[#059669]">We have your schema!</p>
                    <p className="text-sm text-[#059669]/80">Room dimensions are ready to view below.</p>
                  </div>
                </div>
                {schema.floor_plan_url && (
                  <a
                    href={schema.floor_plan_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    View Floor Plan
                  </a>
                )}
              </div>

              {/* House Details */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-[#64748B]">{schema.builder_name}</p>
                      {schema.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#10B981] text-white text-xs font-medium rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-xl font-bold text-[#0F172A]">{schema.model_name}</h1>
                    <p className="text-sm text-[#64748B] mt-1">
                      {schema.bedrooms} bed {schema.property_type}
                      {schema.year_from && (
                        <span className="ml-1 text-xs">
                          (Built {schema.year_from}{schema.year_to && schema.year_to !== schema.year_from ? `-${schema.year_to}` : '+'})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Optional Reason Question - aligned right */}
                  <div className="flex flex-col items-end gap-1">
                    <label className="text-xs text-[#64748B]">
                      Why do you need this? <span className="text-[#94A3B8]">(optional)</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={selectedReason}
                        onChange={(e) => handleReasonChange(e.target.value)}
                        disabled={reasonSubmitted}
                        className="px-2 py-1 text-xs rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-[#64748B]"
                      >
                        <option value="">Select...</option>
                        {REASONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                      {!reasonSubmitted ? (
                        <button
                          onClick={handleReasonSubmit}
                          disabled={!selectedReason || isSubmittingReason}
                          className="px-2 py-1 text-xs bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingReason ? '...' : 'Submit'}
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-[#059669] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Thanks!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schema Notes Warning */}
              {schema.notes && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Important Note</p>
                    <p className="text-sm text-amber-700 mt-1">{schema.notes}</p>
                  </div>
                </div>
              )}

              {/* Rooms List */}
              {rooms.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-[#E2E8F0]">
                  <p className="text-[#64748B]">No room dimensions available for this schema yet.</p>
                  <button
                    onClick={() => handleReportProblem()}
                    className="mt-4 text-[#10B981] hover:text-[#059669] font-medium"
                  >
                    Request room dimensions
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(roomsByFloor)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([floor, floorRooms]) => (
                      <div key={floor}>
                        <h2 className="text-sm font-semibold text-[#0F172A] mb-2">
                          {FLOOR_LABELS[Number(floor)] || `Floor ${floor}`}
                        </h2>
                        <div className="space-y-2">
                          {floorRooms.map((room) => {
                            const colors = getRoomTypeColor(room.room_type)
                            return (
                            <div
                              key={room.id}
                              data-room-id={room.id}
                              className="bg-white rounded-lg border border-[#E2E8F0] border-l-4 overflow-hidden"
                              style={{ borderLeftColor: colors.border }}
                            >
                              {/* Room Header (clickable) */}
                              <button
                                onClick={(e) => handleRoomClick(room, e)}
                                className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <span
                                    className="px-2 py-0.5 text-xs font-medium rounded-full"
                                    style={{ backgroundColor: colors.badgeBg, color: colors.badgeText }}
                                  >
                                    {room.room_type}
                                  </span>
                                  <span className="font-medium text-sm text-[#0F172A]">{room.room_name}</span>
                                  {room.dimensions_need_verification && (
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-[#64748B]">
                                    {calculateArea(room.length_cm, room.width_cm)} m²
                                  </span>
                                  {expandedRoom === room.id ? (
                                    <ChevronUp className="w-4 h-4 text-[#64748B]" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-[#64748B]" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Dimensions */}
                              {expandedRoom === room.id && (
                                <div className="px-3 pb-3 border-t border-[#E2E8F0]">
                                  {/* Floor Dimensions Header */}
                                  <div className="text-center pt-3 pb-1">
                                    <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">
                                      Floor Dimensions
                                    </h3>
                                  </div>

                                  {/* Dimensions Display */}
                                  <div className="grid grid-cols-3 gap-2 py-2">
                                    <div className="text-center">
                                      <p className="text-xs text-[#64748B]">Width</p>
                                      <p className="text-xl font-bold text-[#0F172A]">
                                        {formatDimension(room.width_cm)}
                                        <span className="text-sm font-normal text-[#64748B] ml-0.5">m</span>
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-[#64748B]">Length</p>
                                      <p className="text-xl font-bold text-[#0F172A]">
                                        {formatDimension(room.length_cm)}
                                        <span className="text-sm font-normal text-[#64748B] ml-0.5">m</span>
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-xs text-[#64748B]">Area</p>
                                      <p className="text-xl font-bold text-[#10B981]">
                                        {calculateArea(room.length_cm, room.width_cm)}
                                        <span className="text-sm font-normal text-[#64748B] ml-0.5">m²</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Wall Dimensions Section */}
                                  <div className="mt-3 pt-3 border-t border-[#E2E8F0]">
                                    <div className="text-center pb-2">
                                      <h3 className="text-xs font-semibold text-[#0F172A] uppercase tracking-wide">
                                        Wall Dimensions
                                      </h3>
                                    </div>

                                    {/* Walls diagram centered with ceiling height on right */}
                                    <div className="flex items-center justify-center gap-6">
                                      {/* Room Diagram - Centered */}
                                      <svg
                                        viewBox="0 0 200 150"
                                        className="w-40 h-32"
                                      >
                                        {/* Room rectangle */}
                                        <rect
                                          x="30"
                                          y="20"
                                          width="140"
                                          height="100"
                                          fill="none"
                                          stroke="#E2E8F0"
                                          strokeWidth="2"
                                        />

                                        {/* Wall 1 - Top (Length) */}
                                        <line
                                          x1="30"
                                          y1="20"
                                          x2="170"
                                          y2="20"
                                          stroke={hoveredWall === 0 ? '#10B981' : '#64748B'}
                                          strokeWidth={hoveredWall === 0 ? 16 : 12}
                                          strokeLinecap="round"
                                          className="cursor-pointer transition-all"
                                          onMouseEnter={() => setHoveredWall(0)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        />

                                        {/* Wall 2 - Right (Width) */}
                                        <line
                                          x1="170"
                                          y1="20"
                                          x2="170"
                                          y2="120"
                                          stroke={hoveredWall === 1 ? '#10B981' : '#64748B'}
                                          strokeWidth={hoveredWall === 1 ? 16 : 12}
                                          strokeLinecap="round"
                                          className="cursor-pointer transition-all"
                                          onMouseEnter={() => setHoveredWall(1)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        />

                                        {/* Wall 3 - Bottom (Length) */}
                                        <line
                                          x1="170"
                                          y1="120"
                                          x2="30"
                                          y2="120"
                                          stroke={hoveredWall === 2 ? '#10B981' : '#64748B'}
                                          strokeWidth={hoveredWall === 2 ? 16 : 12}
                                          strokeLinecap="round"
                                          className="cursor-pointer transition-all"
                                          onMouseEnter={() => setHoveredWall(2)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        />

                                        {/* Wall 4 - Left (Width) */}
                                        <line
                                          x1="30"
                                          y1="120"
                                          x2="30"
                                          y2="20"
                                          stroke={hoveredWall === 3 ? '#10B981' : '#64748B'}
                                          strokeWidth={hoveredWall === 3 ? 16 : 12}
                                          strokeLinecap="round"
                                          className="cursor-pointer transition-all"
                                          onMouseEnter={() => setHoveredWall(3)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        />

                                        {/* Dimension labels */}
                                        <text x="100" y="10" textAnchor="middle" className="text-xs fill-[#64748B]">
                                          {formatDimension(room.length_cm)}m
                                        </text>
                                        <text x="188" y="75" textAnchor="middle" className="text-xs fill-[#64748B]" transform="rotate(90 188 75)">
                                          {formatDimension(room.width_cm)}m
                                        </text>
                                      </svg>

                                      {/* Ceiling Height Input - Right of walls */}
                                      <div className="flex flex-col items-center gap-1 bg-[#F8FAFC] rounded-lg p-2">
                                        <label className="text-[10px] text-[#64748B] uppercase">Ceiling</label>
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="number"
                                            value={ceilingHeight}
                                            onChange={(e) => setCeilingHeight(parseFloat(e.target.value) || 2.4)}
                                            step="0.1"
                                            min="1.5"
                                            max="5"
                                            className="w-14 px-1 py-1 text-sm text-center border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                          />
                                          <span className="text-xs text-[#64748B]">m</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Hovered Wall Info */}
                                    <div className="text-center py-1 bg-[#F8FAFC] rounded-lg mb-2 min-h-[36px] flex flex-col justify-center">
                                      {hoveredWall !== null ? (
                                        <p className="text-xs text-[#64748B]">
                                          {getWallDimensions(room).walls[hoveredWall].name}: {getWallDimensions(room).walls[hoveredWall].length.toFixed(2)}m × {ceilingHeight}m = {' '}
                                          <span className="font-semibold text-[#10B981]">
                                            {getWallDimensions(room).walls[hoveredWall].area.toFixed(2)} m²
                                          </span>
                                        </p>
                                      ) : (
                                        <p className="text-xs text-[#94A3B8]">Hover a wall to see details</p>
                                      )}
                                    </div>

                                    {/* Wall Areas Grid */}
                                    <div className="grid grid-cols-4 gap-2 py-1">
                                      {getWallDimensions(room).walls.map((wall, index) => (
                                        <div
                                          key={index}
                                          className={`p-2 rounded-lg border transition-colors cursor-pointer text-center ${
                                            hoveredWall === index
                                              ? 'bg-[#ECFDF5] border-[#10B981]'
                                              : 'bg-[#F8FAFC] border-[#E2E8F0]'
                                          }`}
                                          onMouseEnter={() => setHoveredWall(index)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        >
                                          <p className="text-[10px] text-[#64748B]">Wall {index + 1}</p>
                                          <p className="text-sm font-bold text-[#0F172A]">
                                            {wall.area.toFixed(1)}m²
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Total Wall Area */}
                                    <div className="mt-2 p-2 bg-[#0F172A] rounded-lg text-center">
                                      <p className="text-xs text-gray-400">Total Wall Area</p>
                                      <p className="text-xl font-bold text-[#10B981]">
                                        {getWallDimensions(room).totalArea.toFixed(2)}
                                        <span className="text-sm font-normal text-gray-400 ml-0.5">m²</span>
                                      </p>
                                    </div>

                                    {/* Wall Disclaimer */}
                                    <p className="mt-2 text-[10px] text-amber-600 text-center">
                                      ⚠️ Wall measurements are approximate. Account for doors, windows, skirting etc.
                                    </p>
                                  </div>

                                  {/* Verification Warning */}
                                  {room.dimensions_need_verification && (
                                    <div className="bg-red-50 border border-red-200 rounded p-2 mt-2 flex items-start gap-2">
                                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-xs text-red-700">
                                        <span className="font-medium">Needs verification</span>
                                        {room.verification_reason && `: ${room.verification_reason}`}
                                      </p>
                                    </div>
                                  )}

                                  {/* Room-specific notes */}
                                  {room.notes && (
                                    <div className="bg-amber-50 border border-amber-200 rounded p-2 mt-2 flex items-start gap-2">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-xs text-amber-700">{room.notes}</p>
                                    </div>
                                  )}

                                  {/* Report problem link */}
                                  <button
                                    onClick={() => handleReportProblem(room.room_name)}
                                    className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#10B981] transition-colors mt-2"
                                  >
                                    <Flag className="w-3 h-3" />
                                    Report a problem
                                  </button>
                                </div>
                              )}
                            </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-6 p-3 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                <p className="text-xs text-[#64748B]">
                  <strong className="text-[#0F172A]">Important:</strong> Standard schema for {schema.builder_name} {schema.model_name}. Properties may vary. Always measure before ordering.
                </p>
              </div>

              {/* Report Problem Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleReportProblem()}
                  className="text-[#64748B] hover:text-[#10B981] text-xs font-medium transition-colors"
                >
                  Something wrong? Report a problem →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Problem Report Modal */}
      <ProblemReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        schemaId={schema?.id}
        builderName={schema?.builder_name}
        modelName={schema?.model_name}
        roomName={reportRoomName}
      />
    </>
  )
}

export default function RoomsPage() {
  return (
    <Suspense fallback={<RoomsPageSkeleton />}>
      <RoomsContent />
    </Suspense>
  )
}
