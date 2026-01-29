'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Home, BadgeCheck } from 'lucide-react'
import Image from 'next/image'
import SchemaRequestModal from '@/components/SchemaRequestModal'
import { HousesPageSkeleton } from '@/components/LoadingSkeleton'

interface House {
  schema_id: string
  model_name: string
  builder_name: string
  bedrooms: number
  property_type: string
  exterior_photo_url: string | null
  verified: boolean
}

interface StreetInfo {
  street_name: string
  postcode: string | null
  postcode_area: string | null
}

function HousesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const streetId = searchParams.get('street_id')

  const [houses, setHouses] = useState<House[]>([])
  const [streetInfo, setStreetInfo] = useState<StreetInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!streetId) {
      router.push('/')
      return
    }

    const fetchHouses = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/get-houses?street_id=${encodeURIComponent(streetId)}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load houses')
          return
        }

        setHouses(data.houses || [])
        setStreetInfo(data.street || null)
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHouses()
  }, [streetId, router])

  const handleHouseClick = async (house: House) => {
    // Log analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'house_selected',
        event_data: {
          schema_id: house.schema_id,
          model_name: house.model_name,
          builder_name: house.builder_name,
        },
        page_url: '/houses',
      }),
    }).catch(() => {})

    router.push(`/rooms?schema_id=${house.schema_id}`)
  }

  return (
    <>
      <div className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#64748B] hover:text-[#0F172A] text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to streets
            </button>

            {streetInfo ? (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                    {streetInfo.street_name}
                  </h1>
                  {streetInfo.postcode_area && (
                    <span className="inline-flex items-center px-3 py-1 bg-[#F8FAFC] text-[#64748B] text-sm font-medium rounded-full">
                      {streetInfo.postcode_area}
                    </span>
                  )}
                </div>
                {streetInfo.postcode && (
                  <p className="text-[#64748B]">{streetInfo.postcode}</p>
                )}
              </>
            ) : (
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A]">
                Select your house type
              </h1>
            )}
            <p className="text-[#64748B] mt-2">
              Choose your house type to see room dimensions
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E2E8F0] border-t-[#10B981] rounded-full animate-spin"></div>
              <p className="text-[#64748B] mt-4">Loading house types...</p>
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

          {/* No Results */}
          {!isLoading && !error && houses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                No house types found for this street
              </h2>
              <p className="text-[#64748B] mb-6 max-w-md mx-auto">
                We haven't mapped this street yet. Request a schema and we'll add it soon.
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors"
              >
                Request this schema
              </button>
            </div>
          )}

          {/* Houses Grid */}
          {!isLoading && !error && houses.length > 0 && (
            <>
              <p className="text-sm text-[#64748B] mb-4">
                {houses.length} house type{houses.length !== 1 ? 's' : ''} found
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {houses.map((house) => (
                  <button
                    key={house.schema_id}
                    onClick={() => handleHouseClick(house)}
                    className="text-left bg-white rounded-xl overflow-hidden border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-lg transition-all group"
                  >
                    {/* House Image */}
                    <div className="relative aspect-[4/3] bg-[#F8FAFC]">
                      {house.exterior_photo_url ? (
                        <Image
                          src={house.exterior_photo_url}
                          alt={`${house.builder_name} ${house.model_name}`}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Home className="w-16 h-16 text-[#E2E8F0]" />
                        </div>
                      )}
                      {house.verified && (
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#10B981] text-white text-xs font-medium rounded-full">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    {/* House Info */}
                    <div className="p-4">
                      <p className="text-sm text-[#64748B] mb-1">
                        {house.builder_name}
                      </p>
                      <h3 className="font-semibold text-[#0F172A] group-hover:text-[#10B981] transition-colors mb-2">
                        {house.model_name}
                      </h3>
                      <p className="text-sm text-[#64748B]">
                        {house.bedrooms} bed {house.property_type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Can't find house */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[#64748B] hover:text-[#10B981] text-sm font-medium transition-colors"
                >
                  Can't find your house type? Request a schema →
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schema Request Modal */}
      <SchemaRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

export default function HousesPage() {
  return (
    <Suspense fallback={<HousesPageSkeleton />}>
      <HousesContent />
    </Suspense>
  )
}
