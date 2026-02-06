'use client'

import { useState, useEffect } from 'react'
import { X, Home, ArrowRight, MapPin } from 'lucide-react'

interface HouseResult {
  schema_id: string
  model_name: string
  builder_name: string
  bedrooms: number
  property_type: string
  exterior_photo_url: string | null
  verified: boolean
}

interface SchemaStreet {
  street_id: string
  street_name: string
  postcode: string | null
  postcode_area: string
  development_id: string | null
  development_name: string | null
}

interface PostcodePromptModalProps {
  isOpen: boolean
  onClose: () => void
  house: HouseResult | null
  onSubmit: (schemaId: string) => void
}

export default function PostcodePromptModal({ isOpen, onClose, house, onSubmit }: PostcodePromptModalProps) {
  const [streets, setStreets] = useState<SchemaStreet[]>([])
  const [isLoadingStreets, setIsLoadingStreets] = useState(true)
  const [showPostcodeForm, setShowPostcodeForm] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && house) {
      fetchStreets()
    }
    if (!isOpen) {
      setStreets([])
      setShowPostcodeForm(false)
      setPostcode('')
      setError(null)
      setIsLoadingStreets(true)
    }
  }, [isOpen, house])

  const fetchStreets = async () => {
    if (!house) return
    setIsLoadingStreets(true)
    try {
      const response = await fetch(`/api/schema-streets?schema_id=${house.schema_id}`)
      if (!response.ok) throw new Error('Failed to fetch streets')
      const data = await response.json()
      setStreets(data.streets || [])
      // If no streets, go straight to postcode form
      if (!data.streets || data.streets.length === 0) {
        setShowPostcodeForm(true)
      }
    } catch {
      // If fetch fails, show postcode form as fallback
      setShowPostcodeForm(true)
    } finally {
      setIsLoadingStreets(false)
    }
  }

  const handleStreetSelect = (street: SchemaStreet) => {
    if (!house) return

    // Log analytics
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'house_street_selected',
        event_data: {
          schema_id: house.schema_id,
          street_id: street.street_id,
          street_name: street.street_name,
          postcode: street.postcode,
        },
        page_url: '/',
      }),
    }).catch(() => {})

    onSubmit(house.schema_id)
  }

  const handlePostcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!postcode.trim() || !house) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/schema-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode: postcode.trim(),
          schema_id: house.schema_id,
          model_name: house.model_name,
          builder_name: house.builder_name,
          source: 'house_search',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Something went wrong')
        return
      }

      onSubmit(house.schema_id)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !house) return null

  // Group streets by development
  const grouped: { [key: string]: SchemaStreet[] } = {}
  for (const street of streets) {
    const key = street.development_name || 'Other streets'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(street)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A]">We have your house!</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* House Info */}
        <div className="px-6 pt-5 pb-3">
          <div className="flex items-center gap-4 p-4 bg-[#ECFDF5] rounded-xl">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Home className="w-6 h-6 text-[#10B981]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-[#059669] font-medium">{house.builder_name}</p>
              <p className="font-semibold text-[#0F172A] truncate">{house.model_name}</p>
              <p className="text-sm text-[#64748B]">{house.bedrooms} bed {house.property_type}</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-3">
          {/* Loading */}
          {isLoadingStreets && (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-3 border-[#E2E8F0] border-t-[#10B981] rounded-full animate-spin"></div>
              <p className="text-sm text-[#64748B] mt-2">Finding your streets...</p>
            </div>
          )}

          {/* Street Selection */}
          {!isLoadingStreets && !showPostcodeForm && streets.length > 0 && (
            <div className="space-y-3">
              <p className="text-[#64748B] text-sm">
                Select your street to see room dimensions:
              </p>

              <div className="max-h-60 overflow-y-auto space-y-1">
                {Object.entries(grouped).map(([devName, devStreets]) => (
                  <div key={devName}>
                    {streets.length > 3 && (
                      <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wide px-2 pt-2 pb-1">
                        {devName}
                      </p>
                    )}
                    {devStreets.map((street) => (
                      <button
                        key={street.street_id}
                        onClick={() => handleStreetSelect(street)}
                        className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-[#F8FAFC] transition-colors flex items-center gap-3 group"
                      >
                        <MapPin className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#0F172A] group-hover:text-[#10B981] truncate">
                            {street.street_name}
                          </p>
                          {street.postcode && (
                            <p className="text-xs text-[#94A3B8]">{street.postcode}</p>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#10B981] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                ))}
              </div>

              {/* Not listed option */}
              <button
                onClick={() => setShowPostcodeForm(true)}
                className="w-full py-2.5 text-[#10B981] hover:text-[#059669] text-sm font-medium transition-colors border-t border-[#E2E8F0] mt-2 pt-3"
              >
                My street isn't listed
              </button>
            </div>
          )}

          {/* Postcode Form (fallback) */}
          {!isLoadingStreets && showPostcodeForm && (
            <form onSubmit={handlePostcodeSubmit} className="space-y-4">
              <p className="text-[#64748B] text-sm">
                {streets.length > 0
                  ? "Enter your postcode so we can add your street."
                  : "Please enter your postcode so we can add your development."
                }
              </p>

              {error && (
                <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="prompt-postcode" className="block text-sm font-medium text-[#0F172A] mb-1">
                  Your postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="prompt-postcode"
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value)}
                  placeholder="e.g. L32 7XY"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !postcode.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : (
                  <>
                    See my room dimensions
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {streets.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowPostcodeForm(false)}
                  className="w-full py-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium transition-colors"
                >
                  Back to street list
                </button>
              )}
            </form>
          )}

          {/* Skip */}
          {!isLoadingStreets && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium transition-colors mt-2"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
