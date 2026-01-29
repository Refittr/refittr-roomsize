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

const ROOM_TYPE_COLORS: Record<string, string> = {
  kitchen: 'bg-orange-100 text-orange-700',
  bedroom: 'bg-blue-100 text-blue-700',
  bathroom: 'bg-cyan-100 text-cyan-700',
  'en-suite': 'bg-cyan-100 text-cyan-700',
  'living room': 'bg-green-100 text-green-700',
  lounge: 'bg-green-100 text-green-700',
  dining: 'bg-amber-100 text-amber-700',
  hallway: 'bg-gray-100 text-gray-700',
  utility: 'bg-purple-100 text-purple-700',
  garage: 'bg-slate-100 text-slate-700',
  study: 'bg-indigo-100 text-indigo-700',
  office: 'bg-indigo-100 text-indigo-700',
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

        // Auto-expand first room
        if (data.rooms && data.rooms.length > 0) {
          setExpandedRoom(data.rooms[0].id)
        }
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSchema()
  }, [schemaId, router])

  const handleRoomClick = (room: Room) => {
    // Toggle expansion
    if (expandedRoom === room.id) {
      setExpandedRoom(null)
    } else {
      setExpandedRoom(room.id)

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

  const getRoomTypeColor = (roomType: string): string => {
    const type = roomType.toLowerCase()
    return ROOM_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'
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
              <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-[#10B981] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[#059669]">We have your schema!</p>
                  <p className="text-sm text-[#059669]/80">Room dimensions are ready to view below.</p>
                </div>
              </div>

              {/* House Details */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-[#64748B] mb-1">{schema.builder_name}</p>
                    <h1 className="text-2xl font-bold text-[#0F172A]">{schema.model_name}</h1>
                    <p className="text-[#64748B] mt-1">
                      {schema.bedrooms} bed {schema.property_type}
                      {schema.year_from && (
                        <span className="ml-2 text-sm">
                          (Built {schema.year_from}{schema.year_to && schema.year_to !== schema.year_from ? `-${schema.year_to}` : '+' })
                        </span>
                      )}
                    </p>
                  </div>
                  {schema.verified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981] text-white text-sm font-medium rounded-full self-start">
                      <CheckCircle2 className="w-4 h-4" />
                      Verified Schema
                    </span>
                  )}
                </div>

                {/* Optional Reason Question */}
                <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                  <label className="block text-sm font-medium text-[#0F172A] mb-2">
                    Can you tell us why you need this? <span className="text-[#94A3B8]">(optional)</span>
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select
                      value={selectedReason}
                      onChange={(e) => handleReasonChange(e.target.value)}
                      disabled={reasonSubmitted}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-[#64748B]"
                    >
                      <option value="">Select a reason...</option>
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
                        className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingReason ? 'Saving...' : 'Submit'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 text-[#059669] font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Thanks for letting us know!
                      </span>
                    )}
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
                <div className="space-y-6">
                  {Object.entries(roomsByFloor)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([floor, floorRooms]) => (
                      <div key={floor}>
                        <h2 className="text-lg font-semibold text-[#0F172A] mb-3">
                          {FLOOR_LABELS[Number(floor)] || `Floor ${floor}`}
                        </h2>
                        <div className="space-y-3">
                          {floorRooms.map((room) => (
                            <div
                              key={room.id}
                              className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden"
                            >
                              {/* Room Header (clickable) */}
                              <button
                                onClick={() => handleRoomClick(room)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-[#F8FAFC] transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoomTypeColor(room.room_type)}`}>
                                    {room.room_type}
                                  </span>
                                  <span className="font-semibold text-[#0F172A]">{room.room_name}</span>
                                  {room.dimensions_need_verification && (
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-[#64748B]">
                                    {calculateArea(room.length_cm, room.width_cm)} m²
                                  </span>
                                  {expandedRoom === room.id ? (
                                    <ChevronUp className="w-5 h-5 text-[#64748B]" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-[#64748B]" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Dimensions */}
                              {expandedRoom === room.id && (
                                <div className="px-4 pb-4 border-t border-[#E2E8F0]">
                                  {/* Floor Dimensions Header */}
                                  <div className="text-center pt-4 pb-2">
                                    <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
                                      Floor Dimensions
                                    </h3>
                                    <p className="text-xs text-[#64748B] mt-1">
                                      For flooring, carpet & underlay calculations
                                    </p>
                                  </div>

                                  {/* Large Dimensions Display */}
                                  <div className="grid grid-cols-3 gap-4 py-4">
                                    <div className="text-center">
                                      <p className="text-sm text-[#64748B] mb-1">Width</p>
                                      <p className="text-3xl md:text-4xl font-bold text-[#0F172A]">
                                        {formatDimension(room.width_cm)}
                                        <span className="text-lg font-normal text-[#64748B] ml-1">m</span>
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-[#64748B] mb-1">Length</p>
                                      <p className="text-3xl md:text-4xl font-bold text-[#0F172A]">
                                        {formatDimension(room.length_cm)}
                                        <span className="text-lg font-normal text-[#64748B] ml-1">m</span>
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-sm text-[#64748B] mb-1">Floor Area</p>
                                      <p className="text-3xl md:text-4xl font-bold text-[#10B981]">
                                        {calculateArea(room.length_cm, room.width_cm)}
                                        <span className="text-lg font-normal text-[#64748B] ml-1">m²</span>
                                      </p>
                                    </div>
                                  </div>

                                  {/* Wall Dimensions Section */}
                                  <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                                    <div className="text-center pb-2">
                                      <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wide">
                                        Wall Dimensions
                                      </h3>
                                      <p className="text-xs text-[#64748B] mt-1">
                                        For paint, wallpaper & tile calculations
                                      </p>
                                    </div>

                                    {/* Ceiling Height Input */}
                                    <div className="flex items-center justify-center gap-3 py-3">
                                      <label className="text-sm text-[#64748B]">Ceiling height:</label>
                                      <input
                                        type="number"
                                        value={ceilingHeight}
                                        onChange={(e) => setCeilingHeight(parseFloat(e.target.value) || 2.4)}
                                        step="0.1"
                                        min="1.5"
                                        max="5"
                                        className="w-20 px-3 py-1.5 text-center border border-[#E2E8F0] rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                                      />
                                      <span className="text-sm text-[#64748B]">m</span>
                                    </div>

                                    {/* Room Diagram */}
                                    <div className="flex justify-center py-4">
                                      <svg
                                        viewBox="0 0 200 150"
                                        className="w-full max-w-xs"
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
                                          stroke={hoveredWall === 0 ? '#10B981' : '#94A3B8'}
                                          strokeWidth={hoveredWall === 0 ? 12 : 8}
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
                                          stroke={hoveredWall === 1 ? '#10B981' : '#94A3B8'}
                                          strokeWidth={hoveredWall === 1 ? 12 : 8}
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
                                          stroke={hoveredWall === 2 ? '#10B981' : '#94A3B8'}
                                          strokeWidth={hoveredWall === 2 ? 12 : 8}
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
                                          stroke={hoveredWall === 3 ? '#10B981' : '#94A3B8'}
                                          strokeWidth={hoveredWall === 3 ? 12 : 8}
                                          strokeLinecap="round"
                                          className="cursor-pointer transition-all"
                                          onMouseEnter={() => setHoveredWall(3)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        />

                                        {/* Dimension labels */}
                                        <text x="100" y="12" textAnchor="middle" className="text-xs fill-[#64748B]">
                                          {formatDimension(room.length_cm)}m
                                        </text>
                                        <text x="185" y="75" textAnchor="middle" className="text-xs fill-[#64748B]" transform="rotate(90 185 75)">
                                          {formatDimension(room.width_cm)}m
                                        </text>
                                      </svg>
                                    </div>

                                    {/* Hovered Wall Info - Fixed height to prevent layout shift */}
                                    <div className="text-center py-2 bg-[#F8FAFC] rounded-lg mb-3 min-h-[52px] flex flex-col justify-center">
                                      {hoveredWall !== null ? (
                                        <>
                                          <p className="text-sm font-medium text-[#0F172A]">
                                            {getWallDimensions(room).walls[hoveredWall].name}
                                          </p>
                                          <p className="text-xs text-[#64748B]">
                                            {getWallDimensions(room).walls[hoveredWall].length.toFixed(2)}m × {ceilingHeight}m = {' '}
                                            <span className="font-semibold text-[#10B981]">
                                              {getWallDimensions(room).walls[hoveredWall].area.toFixed(2)} m²
                                            </span>
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-sm text-[#94A3B8]">Select a wall above to see details</p>
                                      )}
                                    </div>

                                    {/* Wall Areas Grid */}
                                    <div className="grid grid-cols-2 gap-3 py-2">
                                      {getWallDimensions(room).walls.map((wall, index) => (
                                        <div
                                          key={index}
                                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                            hoveredWall === index
                                              ? 'bg-[#ECFDF5] border-[#10B981]'
                                              : 'bg-[#F8FAFC] border-[#E2E8F0]'
                                          }`}
                                          onMouseEnter={() => setHoveredWall(index)}
                                          onMouseLeave={() => setHoveredWall(null)}
                                        >
                                          <p className="text-xs text-[#64748B]">{wall.name}</p>
                                          <p className="text-lg font-bold text-[#0F172A]">
                                            {wall.area.toFixed(2)} <span className="text-sm font-normal">m²</span>
                                          </p>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Total Wall Area */}
                                    <div className="mt-3 p-4 bg-[#0F172A] rounded-lg text-center">
                                      <p className="text-sm text-gray-400">Total Wall Area</p>
                                      <p className="text-3xl font-bold text-[#10B981]">
                                        {getWallDimensions(room).totalArea.toFixed(2)}
                                        <span className="text-lg font-normal text-gray-400 ml-1">m²</span>
                                      </p>
                                    </div>

                                    {/* Wall Disclaimer */}
                                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                      <p className="text-sm text-amber-700 text-center font-medium">
                                        ⚠️ These wall measurements are approximate
                                      </p>
                                      <p className="text-xs text-amber-600 text-center mt-1">
                                        Remember to account for skirting boards, coving, doorways, windows, and any irregular walls or ceiling heights.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Verification Warning */}
                                  {room.dimensions_need_verification && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                      <div>
                                        <p className="text-sm font-medium text-red-700">Verification Required</p>
                                        {room.verification_reason && (
                                          <p className="text-sm text-red-600 mt-1">{room.verification_reason}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Room-specific notes */}
                                  {room.notes && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                      <p className="text-sm text-amber-700">{room.notes}</p>
                                    </div>
                                  )}

                                  {/* Report problem link */}
                                  <button
                                    onClick={() => handleReportProblem(room.room_name)}
                                    className="flex items-center gap-1 text-sm text-[#64748B] hover:text-[#10B981] transition-colors"
                                  >
                                    <Flag className="w-4 h-4" />
                                    Report a problem with these dimensions
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* Disclaimer */}
              <div className="mt-8 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                <p className="text-sm text-[#64748B]">
                  <strong className="text-[#0F172A]">Important:</strong> This is the standard schema for the {schema.builder_name} {schema.model_name}.
                  Dimensions are based on builder specifications. Individual properties may vary due to modifications or building variations.
                  <strong> Always measure before ordering materials.</strong>
                </p>
              </div>

              {/* Report Problem Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => handleReportProblem()}
                  className="text-[#64748B] hover:text-[#10B981] text-sm font-medium transition-colors"
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
