'use client'

// Reusable skeleton components for loading states

export function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#E2E8F0] rounded ${className}`} />
  )
}

export function SearchSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonPulse className="h-12 w-full rounded-xl" />
      <div className="flex gap-2 justify-center">
        <SkeletonPulse className="h-6 w-20" />
        <SkeletonPulse className="h-6 w-24" />
        <SkeletonPulse className="h-6 w-16" />
      </div>
    </div>
  )
}

export function StreetCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <SkeletonPulse className="h-6 w-3/4 mb-2" />
      <SkeletonPulse className="h-4 w-1/2 mb-1" />
      <SkeletonPulse className="h-4 w-1/3" />
    </div>
  )
}

export function StreetsPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <SkeletonPulse className="h-6 w-32 mb-6" />

        {/* Header */}
        <SkeletonPulse className="h-8 w-64 mb-2" />
        <SkeletonPulse className="h-5 w-48 mb-6" />

        {/* Street cards */}
        <div className="space-y-3">
          <StreetCardSkeleton />
          <StreetCardSkeleton />
          <StreetCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function HouseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <SkeletonPulse className="h-40 w-full" />
      <div className="p-4">
        <SkeletonPulse className="h-4 w-24 mb-2" />
        <SkeletonPulse className="h-6 w-3/4 mb-2" />
        <div className="flex gap-2">
          <SkeletonPulse className="h-6 w-16 rounded-full" />
          <SkeletonPulse className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function HousesPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <SkeletonPulse className="h-6 w-32 mb-6" />

        {/* Header */}
        <SkeletonPulse className="h-8 w-72 mb-2" />
        <SkeletonPulse className="h-5 w-56 mb-6" />

        {/* House cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <HouseCardSkeleton />
          <HouseCardSkeleton />
          <HouseCardSkeleton />
          <HouseCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonPulse className="h-6 w-16 rounded-full" />
          <SkeletonPulse className="h-5 w-24" />
        </div>
        <SkeletonPulse className="h-5 w-16" />
      </div>
    </div>
  )
}

export function RoomsPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back button */}
        <SkeletonPulse className="h-6 w-32 mb-6" />

        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] p-6 mb-6">
          <SkeletonPulse className="h-4 w-32 mb-2" />
          <SkeletonPulse className="h-8 w-64 mb-4" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-6 w-20 rounded-full" />
            <SkeletonPulse className="h-6 w-24 rounded-full" />
          </div>
        </div>

        {/* Room cards */}
        <div className="space-y-3">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      </div>
    </div>
  )
}

export function AdminTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] p-4 flex gap-4">
        <SkeletonPulse className="h-4 w-24" />
        <SkeletonPulse className="h-4 w-32" />
        <SkeletonPulse className="h-4 w-20" />
        <SkeletonPulse className="h-4 w-28" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-[#E2E8F0] p-4 flex gap-4">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-4 w-32" />
          <SkeletonPulse className="h-4 w-20" />
          <SkeletonPulse className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}
