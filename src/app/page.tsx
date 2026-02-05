'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Home, BadgeCheck } from 'lucide-react'
import SchemaRequestModal from '@/components/SchemaRequestModal'
import PostcodePromptModal from '@/components/PostcodePromptModal'

interface HouseResult {
  schema_id: string
  model_name: string
  builder_name: string
  bedrooms: number
  property_type: string
  exterior_photo_url: string | null
  verified: boolean
}

export default function HomePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [houseResults, setHouseResults] = useState<HouseResult[]>([])
  const [showPostcodePrompt, setShowPostcodePrompt] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState<HouseResult | null>(null)

  // Log page view on mount
  useEffect(() => {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'landing_page_view',
        page_url: '/',
      }),
    }).catch(() => {})
  }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsSearching(true)
    setError(null)
    setHouseResults([])

    try {
      const response = await fetch(`/api/search-location?query=${encodeURIComponent(query.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed')
        return
      }

      // If we have street results, navigate to streets page
      if (data.results.length > 0) {
        router.push(`/streets?query=${encodeURIComponent(query.trim())}`)
        return
      }

      // If no street results but we have house results, show them here
      if (data.houses && data.houses.length > 0) {
        setHouseResults(data.houses)
        return
      }

      // Nothing found
      setError('No results found. Try a different postcode, development name, or house type.')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleHouseClick = (house: HouseResult) => {
    setSelectedHouse(house)
    setShowPostcodePrompt(true)

    // Log analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'house_search_result_clicked',
        event_data: {
          schema_id: house.schema_id,
          model_name: house.model_name,
          builder_name: house.builder_name,
        },
        page_url: '/',
      }),
    }).catch(() => {})
  }

  const handlePostcodeSubmit = (schemaId: string) => {
    setShowPostcodePrompt(false)
    router.push(`/rooms?schema_id=${schemaId}`)
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center max-w-2xl w-full">
          {/* Logo/Branding */}
          <h1 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-2">
            RoomSize
          </h1>
          <p className="text-lg text-[#10B981] font-medium mb-6">
            by Refittr
          </p>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-[#64748B] mb-10">
            Know your room dimensions instantly.
            <br />
            <span className="text-[#0F172A] font-medium">No measuring required.</span>
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Postcode, development, or house type"
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching || !query.trim()}
                className="px-8 py-4 bg-[#10B981] hover:bg-[#059669] text-white text-lg font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <p className="text-red-600 text-sm mb-4">{error}</p>
          )}

          {/* House Search Results */}
          {houseResults.length > 0 && (
            <div className="w-full max-w-xl mx-auto mt-6 mb-6">
              <div className="bg-[#ECFDF5] border border-[#10B981]/20 rounded-xl p-4 mb-4">
                <p className="text-[#059669] font-medium text-sm">
                  We found {houseResults.length} matching house type{houseResults.length !== 1 ? 's' : ''}! Select yours to see room dimensions.
                </p>
              </div>

              <div className="space-y-3">
                {houseResults.map((house) => (
                  <button
                    key={house.schema_id}
                    onClick={() => handleHouseClick(house)}
                    className="w-full text-left bg-white rounded-xl p-4 border border-[#E2E8F0] hover:border-[#10B981] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#F8FAFC] rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {house.exterior_photo_url ? (
                          <img
                            src={house.exterior_photo_url}
                            alt={house.model_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Home className="w-7 h-7 text-[#E2E8F0]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#64748B]">{house.builder_name}</p>
                        <p className="font-semibold text-[#0F172A] group-hover:text-[#10B981] transition-colors truncate">
                          {house.model_name}
                        </p>
                        <p className="text-sm text-[#64748B]">
                          {house.bedrooms} bed {house.property_type}
                        </p>
                      </div>
                      {house.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#ECFDF5] text-[#10B981] text-xs font-medium rounded-full flex-shrink-0">
                          <BadgeCheck className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Can't find location - PROMINENT CTA */}
          <div className="w-full max-w-xl mx-auto mt-4 mb-10">
            <button
              onClick={() => setShowModal(true)}
              className="w-full px-6 py-4 bg-white border-2 border-dashed border-[#10B981] rounded-xl text-[#0F172A] font-semibold hover:bg-[#ECFDF5] hover:border-solid transition-all group"
            >
              <span className="text-[#10B981] mr-2 text-lg">+</span>
              Can't find your home? Request your schema
            </button>
          </div>

          {/* How it works */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-lg flex items-center justify-center text-[#10B981] font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Search for your home</h3>
              <p className="text-sm text-[#64748B]">
                Search by postcode, development name, or house type to find your property.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-lg flex items-center justify-center text-[#10B981] font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Select your house type</h3>
              <p className="text-sm text-[#64748B]">
                Choose your builder and house type from verified schemas.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-lg flex items-center justify-center text-[#10B981] font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Get your dimensions</h3>
              <p className="text-sm text-[#64748B]">
                Instantly see room sizes for flooring, furniture, and more.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Schema Request Modal */}
      <SchemaRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Postcode Prompt Modal */}
      <PostcodePromptModal
        isOpen={showPostcodePrompt}
        onClose={() => setShowPostcodePrompt(false)}
        house={selectedHouse}
        onSubmit={handlePostcodeSubmit}
      />
    </>
  )
}
