'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ProblemReportModalProps {
  isOpen: boolean
  onClose: () => void
  schemaId?: string
  builderName?: string
  modelName?: string
  roomName?: string
}

export default function ProblemReportModal({
  isOpen,
  onClose,
  schemaId,
  builderName,
  modelName,
  roomName,
}: ProblemReportModalProps) {
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/report-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_id: schemaId,
          builder_name: builderName,
          house_type: modelName,
          room_name: roomName,
          problem_description: description,
          email: email || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' })
      } else {
        setMessage({ type: 'success', text: "Thanks for reporting. We'll investigate and get back to you." })
        setDescription('')
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
          <h2 className="text-xl font-bold text-[#0F172A]">Report a Problem</h2>
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

          {/* Context Info */}
          {(builderName || modelName || roomName) && (
            <div className="bg-[#F8FAFC] rounded-lg p-4 text-sm">
              {builderName && (
                <p className="text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">Builder:</span> {builderName}
                </p>
              )}
              {modelName && (
                <p className="text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">Model:</span> {modelName}
                </p>
              )}
              {roomName && (
                <p className="text-[#64748B]">
                  <span className="font-medium text-[#0F172A]">Room:</span> {roomName}
                </p>
              )}
            </div>
          )}

          {/* Problem Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#0F172A] mb-1">
              What's wrong? <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., The kitchen dimensions are incorrect - my kitchen is actually 3.5m x 4.2m, not what's shown here."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent resize-none"
            />
            <p className="text-xs text-[#94A3B8] mt-1">
              Please be as specific as possible - include actual measurements if you have them.
            </p>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0F172A] mb-1">
              Email <span className="text-[#94A3B8]">(so we can follow up)</span>
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
            disabled={isSubmitting || description.trim().length < 10}
            className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  )
}
