'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, MapPin, Building2 } from 'lucide-react'
import SchemaRequestModal from '@/components/SchemaRequestModal'
import { StreetsPageSkeleton } from '@/components/LoadingSkeleton'

interface Street {
  street_id: string
  street_name: string
  postcode: string | null
  postcode_area: string | null
  development_id: string | null
  development_name: string | null
}

function StreetsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('query') || ''

  const [streets, setStreets] = useState<Street[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!query) {
      router.push('/')
      return
    }

    const fetchStreets = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/search-location?query=${encodeURIComponent(query)}`)
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || 'Failed to load streets')
          return
        }

        setStreets(data.results || [])
      } catch {
        setError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchStreets()
  }, [query, router])

  const handleStreetClick = async (street: Street) => {
    // Log analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'street_selected',
        event_data: {
          street_id: street.street_id,
          street_name: street.street_name,
          postcode_area: street.postcode_area,
        },
        page_url: '/streets',
      }),
    }).catch(() => {})

    router.push(`/houses?street_id=${street.street_id}`)
  }

  return (
    <>
      <div className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-[#64748B] hover:text-[#0F172A] text-sm font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to search
            </button>

            <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-2">
              Streets matching "{query}"
            </h1>
            <p className="text-[#64748B]">
              Select your street to see available house types
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#E2E8F0] border-t-[#10B981] rounded-full animate-spin"></div>
              <p className="text-[#64748B] mt-4">Searching streets...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push('/')}
                className="text-[#10B981] hover:text-[#059669] font-medium"
              >
                Try another search
              </button>
            </div>
          )}

          {/* No Results */}
          {!isLoading && !error && streets.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#E2E8F0]">
              <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-[#94A3B8]" />
              </div>
              <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
                No streets found for "{query}"
              </h2>
              <p className="text-[#64748B] mb-6 max-w-md mx-auto">
                Try searching by postcode area (e.g., L32) or development name
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-3 border border-[#E2E8F0] text-[#0F172A] font-medium rounded-lg hover:bg-[#F8FAFC] transition-colors"
                >
                  Search again
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors"
                >
                  Request this schema
                </button>
              </div>
            </div>
          )}

          {/* Results List */}
          {!isLoading && !error && streets.length > 0 && (
            <>
              <p className="text-sm text-[#64748B] mb-4">
                {streets.length} street{streets.length !== 1 ? 's' : ''} found
              </p>

              <div className="space-y-3">
                {streets.map((street) => (
                  <button
                    key={street.street_id}
                    onClick={() => handleStreetClick(street)}
                    className="w-full text-left bg-white rounded-xl p-5 border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Street Name */}
                        <h3 className="font-semibold text-[#0F172A] group-hover:text-[#10B981] transition-colors">
                          {street.street_name}
                        </h3>

                        {/* Postcode */}
                        {street.postcode && (
                          <p className="text-sm text-[#64748B] mt-1">
                            {street.postcode}
                          </p>
                        )}

                        {/* Development Name */}
                        {street.development_name && (
                          <div className="flex items-center text-sm text-[#94A3B8] mt-2">
                            <Building2 className="w-4 h-4 mr-1" />
                            {street.development_name}
                          </div>
                        )}
                      </div>

                      {/* Postcode Area Badge */}
                      {street.postcode_area && (
                        <span className="inline-flex items-center px-3 py-1 bg-[#F8FAFC] text-[#64748B] text-sm font-medium rounded-full">
                          {street.postcode_area}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Can't find street */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowModal(true)}
                  className="text-[#64748B] hover:text-[#10B981] text-sm font-medium transition-colors"
                >
                  Can't find your street? Request a schema →
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

export default function StreetsPage() {
  return (
    <Suspense fallback={<StreetsPageSkeleton />}>
      <StreetsContent />
    </Suspense>
  )
}
