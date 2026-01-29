'use client'

import { AlertCircle, RefreshCw, Home, Search } from 'lucide-react'
import Link from 'next/link'

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  showHomeButton?: boolean
}

export default function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error loading this page. Please try again.',
  onRetry,
  showHomeButton = true,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>

      <h2 className="text-xl font-bold text-[#0F172A] mb-2 text-center">
        {title}
      </h2>

      <p className="text-[#64748B] text-center max-w-sm mb-6">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}

        {showHomeButton && (
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#E2E8F0] hover:bg-white text-[#0F172A] font-semibold rounded-xl transition-colors"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon ? (
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
          {icon}
        </div>
      ) : (
        <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-[#94A3B8]" />
        </div>
      )}

      <h2 className="text-xl font-bold text-[#0F172A] mb-2 text-center">
        {title}
      </h2>

      <p className="text-[#64748B] text-center max-w-sm mb-6">
        {message}
      </p>

      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors"
          >
            {actionLabel}
          </Link>
        ) : (
          <button
            onClick={onAction}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-xl transition-colors"
          >
            {actionLabel}
          </button>
        )
      )}
    </div>
  )
}
