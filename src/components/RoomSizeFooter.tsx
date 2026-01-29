'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export default function RoomSizeFooter() {
  const pathname = usePathname()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/waitlist-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'roomsize_footer',
          page_path: pathname,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Something went wrong' })
      } else {
        setMessage({ type: 'success', text: "Thanks! We'll be in touch soon" })
        setEmail('')
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-white border-t border-[#E2E8F0] py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Branding text */}
          <div className="text-center md:text-left">
            <p className="text-[#0F172A] font-semibold">
              RoomSize
              <span className="text-[#64748B] font-normal ml-2">
                by Refittr
              </span>
            </p>
            <a
              href="https://refittr.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#10B981] hover:text-[#059669] font-medium transition-colors"
            >
              About Refittr →
            </a>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 md:w-64 px-4 py-2.5 rounded-lg border border-[#E2E8F0] text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isSubmitting ? 'Joining...' : 'Join Refittr Waitlist'}
            </button>
          </form>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 text-center md:text-right text-sm ${
            message.type === 'success' ? 'text-[#059669]' : 'text-red-600'
          }`}>
            {message.text}
          </div>
        )}

        {/* Bottom links */}
        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#94A3B8]">
          <p>&copy; {new Date().getFullYear()} Refittr. All rights reserved.</p>
          <Link href="/privacy" className="hover:text-[#64748B] transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
