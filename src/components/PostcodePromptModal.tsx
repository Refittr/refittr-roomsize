'use client'

import { useState } from 'react'
import { X, Home, ArrowRight } from 'lucide-react'

interface HouseResult {
  schema_id: string
  model_name: string
  builder_name: string
  bedrooms: number
  property_type: string
  exterior_photo_url: string | null
  verified: boolean
}

interface PostcodePromptModalProps {
  isOpen: boolean
  onClose: () => void
  house: HouseResult | null
  onSubmit: (schemaId: string) => void
}

export default function PostcodePromptModal({ isOpen, onClose, house, onSubmit }: PostcodePromptModalProps) {
  const [postcode, setPostcode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Navigate to rooms page
      onSubmit(house.schema_id)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !house) return null

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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          <p className="text-[#64748B] text-sm">
            Please enter your postcode so we can add your development.
          </p>

          {error && (
            <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600">
              {error}
            </div>
          )}

          {/* Postcode Input */}
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

          {/* Submit */}
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

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-[#64748B] hover:text-[#0F172A] text-sm font-medium transition-colors"
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  )
}
