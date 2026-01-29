'use client'

import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="text-8xl font-bold text-[#10B981] mb-4">404</div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
          Page not found
        </h1>
        <p className="text-[#64748B] mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. It might have been moved or doesn&apos;t exist.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E2E8F0] hover:bg-white text-[#0F172A] font-semibold rounded-xl transition-colors"
          >
            <Search className="w-5 h-5" />
            Search Again
          </Link>
        </div>
      </div>
    </div>
  )
}
