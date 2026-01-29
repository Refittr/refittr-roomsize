'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface SchemaRequestModalProps {
  isOpen: boolean
  onClose: () => void
}

const REASONS = [
  { value: 'renovation', label: 'Planning renovation' },
  { value: 'flooring', label: 'Buying flooring/carpet' },
  { value: 'viewing', label: 'Viewing properties' },
  { value: 'furniture', label: 'Buying furniture' },
  { value: 'curious', label: 'Just curious' },
  { value: 'other', label: 'Other' },
]

export default function SchemaRequestModal({ isOpen, onClose }: SchemaRequestModalProps) {
  const [postcode, setPostcode] = useState('')
  const [streetName, setStreetName] = useState('')
  const [developmentName, setDevelopmentName] = useState('')
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/schema-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postcode,
          street_name: streetName || undefined,
          development_name: developmentName || undefined,
          reason: reason || undefined,
          email: email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' })
      } else {
        setMessage({ type: 'success', text: "Thanks! We'll add this schema soon and notify you." })
        // Reset form
        setPostcode('')
        setStreetName('')
        setDevelopmentName('')
        setReason('')
        setEmail('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
          <h2 className="text-xl font-bold text-[#0F172A]">Request a Schema</h2>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success/Error Message */}
          {message && (
            <div className={`p-4 rounded-lg text-sm ${
              message.type === 'success'
                ? 'bg-[#ECFDF5] text-[#059669]'
                : 'bg-red-50 text-red-600'
            }`}>
              {message.text}
            </div>
          )}

          {/* Postcode */}
          <div>
            <label htmlFor="postcode" className="block text-sm font-medium text-[#0F172A] mb-1">
              Postcode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="postcode"
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. L1 1AA"
              required
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          {/* Street Name */}
          <div>
            <label htmlFor="streetName" className="block text-sm font-medium text-[#0F172A] mb-1">
              Street name <span className="text-[#94A3B8]">(optional)</span>
            </label>
            <input
              type="text"
              id="streetName"
              value={streetName}
              onChange={(e) => setStreetName(e.target.value)}
              placeholder="e.g. Elm Grove"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          {/* Development Name */}
          <div>
            <label htmlFor="developmentName" className="block text-sm font-medium text-[#0F172A] mb-1">
              Development name <span className="text-[#94A3B8]">(optional)</span>
            </label>
            <input
              type="text"
              id="developmentName"
              value={developmentName}
              onChange={(e) => setDevelopmentName(e.target.value)}
              placeholder="e.g. Meadow View"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          {/* Reason Dropdown */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-[#0F172A] mb-1">
              Why do you need this?
            </label>
            <select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent bg-white"
            >
              <option value="">Select a reason...</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Email (optional) */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1">
              Email <span className="text-[#94A3B8]">(to notify when ready)</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !postcode.trim()}
            className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
