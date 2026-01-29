'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import SchemaRequestModal from '@/components/SchemaRequestModal'

export default function Home() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

    try {
      const response = await fetch(`/api/search-location?query=${encodeURIComponent(query.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Search failed')
        return
      }

      if (data.results.length === 0) {
        setError('No locations found. Try a different postcode or development name.')
        return
      }

      // Navigate to streets page with search results
      router.push(`/streets?query=${encodeURIComponent(query.trim())}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSearching(false)
    }
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
                  placeholder="Enter postcode or development name"
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

          {/* Can't find location */}
          <button
            onClick={() => setShowModal(true)}
            className="text-[#64748B] hover:text-[#10B981] text-sm font-medium transition-colors"
          >
            Can't find your location? Request a schema →
          </button>

          {/* How it works */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E2E8F0]">
              <div className="w-10 h-10 bg-[#ECFDF5] rounded-lg flex items-center justify-center text-[#10B981] font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold text-[#0F172A] mb-2">Enter your postcode</h3>
              <p className="text-sm text-[#64748B]">
                Search by postcode or development name to find your street.
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
    </>
  )
}
