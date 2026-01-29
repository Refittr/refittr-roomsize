'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Search,
  Eye,
  DoorOpen,
  Users,
  AlertTriangle,
  FileQuestion,
  TrendingUp,
  Calendar,
  RefreshCw,
  Lock,
  Home,
  Mail,
} from 'lucide-react'
import { AdminTableSkeleton } from '@/components/LoadingSkeleton'

interface Stats {
  totalSearches: number
  uniquePostcodes: number
  totalPageViews: number
  totalSchemaViews: number
  totalRoomViews: number
  waitlistSignups: number
  schemaRequestsCount: number
  problemReportsCount: number
}

interface SchemaRequest {
  id: string
  postcode: string
  street_name: string
  reason: string | null
  created_at: string
  status: string
}

interface ProblemReport {
  id: string
  house_type: string
  problem_description: string
  user_email: string | null
  created_at: string
  status: string
}

interface WaitlistEntry {
  id: string
  email: string
  created_at: string
}

interface TopItem {
  postcode?: string
  model?: string
  room?: string
  reason?: string
  count: number
}

function AdminDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const adminKey = searchParams.get('key')

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [inputKey, setInputKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [schemaRequests, setSchemaRequests] = useState<SchemaRequest[]>([])
  const [problemReports, setProblemReports] = useState<ProblemReport[]>([])
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
  const [topPostcodes, setTopPostcodes] = useState<TopItem[]>([])
  const [topHouseTypes, setTopHouseTypes] = useState<TopItem[]>([])
  const [topRooms, setTopRooms] = useState<TopItem[]>([])
  const [topReasons, setTopReasons] = useState<TopItem[]>([])
  const [period, setPeriod] = useState('7d')
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'reports' | 'waitlist'>('overview')

  const fetchData = async (key: string, periodFilter: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?key=${key}&period=${periodFilter}`)
      if (response.status === 401) {
        setIsAuthenticated(false)
        return
      }
      const data = await response.json()
      if (data.error) {
        console.error(data.error)
        return
      }
      setStats(data.stats)
      setSchemaRequests(data.schemaRequests)
      setProblemReports(data.problemReports)
      setWaitlist(data.waitlist)
      setTopPostcodes(data.topPostcodes)
      setTopHouseTypes(data.topHouseTypes)
      setTopRooms(data.topRooms)
      setTopReasons(data.topReasons)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (adminKey) {
      fetchData(adminKey, period)
    }
  }, [adminKey, period])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/admin?key=${inputKey}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Login screen
  if (!adminKey || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-[#10B981]" />
            </div>
            <h1 className="text-2xl font-bold text-[#0F172A]">RoomSize Admin</h1>
            <p className="text-[#64748B] mt-1">Enter your admin key to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="Admin key"
              className="w-full px-4 py-3 rounded-lg border border-[#E2E8F0] text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
              required
            />
            <button
              type="submit"
              className="w-full py-3 bg-[#10B981] hover:bg-[#059669] text-white font-semibold rounded-lg transition-colors"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#64748B] hover:text-[#10B981]">
              <Home className="w-4 h-4 inline mr-1" />
              Back to RoomSize
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-[#0F172A] text-white py-6 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">RoomSize Admin</h1>
            <p className="text-gray-400 text-sm">Analytics Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Period filter */}
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="all">All time</option>
            </select>
            <button
              onClick={() => fetchData(adminKey, period)}
              disabled={isLoading}
              className="p-2 hover:bg-[#1E293B] rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading && !stats ? (
          <AdminTableSkeleton rows={5} />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<Search className="w-5 h-5" />}
                label="Total Searches"
                value={stats?.totalSearches || 0}
                subvalue={`${stats?.uniquePostcodes || 0} unique postcodes`}
                color="blue"
              />
              <StatCard
                icon={<Eye className="w-5 h-5" />}
                label="Schema Views"
                value={stats?.totalSchemaViews || 0}
                color="green"
              />
              <StatCard
                icon={<DoorOpen className="w-5 h-5" />}
                label="Room Views"
                value={stats?.totalRoomViews || 0}
                color="purple"
              />
              <StatCard
                icon={<Users className="w-5 h-5" />}
                label="Waitlist Signups"
                value={stats?.waitlistSignups || 0}
                color="emerald"
              />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatCard
                icon={<FileQuestion className="w-5 h-5" />}
                label="Schema Requests"
                value={stats?.schemaRequestsCount || 0}
                color="amber"
              />
              <StatCard
                icon={<AlertTriangle className="w-5 h-5" />}
                label="Problem Reports"
                value={stats?.problemReportsCount || 0}
                color="red"
              />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[#E2E8F0]">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
              >
                <TrendingUp className="w-4 h-4" />
                Overview
              </TabButton>
              <TabButton
                active={activeTab === 'requests'}
                onClick={() => setActiveTab('requests')}
              >
                <FileQuestion className="w-4 h-4" />
                Schema Requests ({schemaRequests.length})
              </TabButton>
              <TabButton
                active={activeTab === 'reports'}
                onClick={() => setActiveTab('reports')}
              >
                <AlertTriangle className="w-4 h-4" />
                Problem Reports ({problemReports.length})
              </TabButton>
              <TabButton
                active={activeTab === 'waitlist'}
                onClick={() => setActiveTab('waitlist')}
              >
                <Mail className="w-4 h-4" />
                Waitlist ({waitlist.length})
              </TabButton>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Top Postcodes */}
                <TopListCard
                  title="Top Postcodes Searched"
                  items={topPostcodes.map(p => ({ label: p.postcode!, count: p.count }))}
                  emptyMessage="No searches yet"
                />

                {/* Top House Types */}
                <TopListCard
                  title="Top House Types Viewed"
                  items={topHouseTypes.map(h => ({ label: h.model!, count: h.count }))}
                  emptyMessage="No house views yet"
                />

                {/* Top Rooms */}
                <TopListCard
                  title="Top Rooms Viewed"
                  items={topRooms.map(r => ({ label: r.room!, count: r.count }))}
                  emptyMessage="No room views yet"
                />

                {/* Top Reasons */}
                <TopListCard
                  title="Why Users Need Dimensions"
                  items={topReasons.map(r => ({ label: r.reason!, count: r.count }))}
                  emptyMessage="No reasons submitted yet"
                />
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {schemaRequests.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B]">
                    No schema requests yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Postcode</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Street</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Reason</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Date</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schemaRequests.map((req) => (
                          <tr key={req.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                            <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{req.postcode}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{req.street_name}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{req.reason || '-'}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(req.created_at)}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={req.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {problemReports.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B]">
                    No problem reports yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">House Type</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Description</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Email</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Date</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problemReports.map((report) => (
                          <tr key={report.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                            <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{report.house_type}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B] max-w-xs truncate">
                              {report.problem_description}
                            </td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{report.user_email || '-'}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(report.created_at)}</td>
                            <td className="px-4 py-3">
                              <StatusBadge status={report.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'waitlist' && (
              <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                {waitlist.length === 0 ? (
                  <div className="p-8 text-center text-[#64748B]">
                    No waitlist signups yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Email</th>
                          <th className="text-left px-4 py-3 text-sm font-semibold text-[#0F172A]">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {waitlist.map((entry) => (
                          <tr key={entry.id} className="border-b border-[#E2E8F0] hover:bg-[#F8FAFC]">
                            <td className="px-4 py-3 text-sm font-medium text-[#0F172A]">{entry.email}</td>
                            <td className="px-4 py-3 text-sm text-[#64748B]">{formatDate(entry.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

// Helper Components
function StatCard({
  icon,
  label,
  value,
  subvalue,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: number
  subvalue?: string
  color: 'blue' | 'green' | 'purple' | 'emerald' | 'amber' | 'red'
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-[#0F172A]">{value.toLocaleString()}</p>
      <p className="text-sm text-[#64748B]">{label}</p>
      {subvalue && <p className="text-xs text-[#94A3B8] mt-1">{subvalue}</p>}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-[#10B981] text-[#10B981]'
          : 'border-transparent text-[#64748B] hover:text-[#0F172A]'
      }`}
    >
      {children}
    </button>
  )
}

function TopListCard({
  title,
  items,
  emptyMessage,
}: {
  title: string
  items: { label: string; count: number }[]
  emptyMessage: string
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
      <h3 className="font-semibold text-[#0F172A] mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-[#94A3B8]">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-sm text-[#64748B] truncate flex-1 mr-2">
                {i + 1}. {item.label}
              </span>
              <span className="text-sm font-semibold text-[#0F172A]">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusClasses: Record<string, string> = {
    open: 'bg-amber-100 text-amber-700',
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10B981]"></div>
      </div>
    }>
      <AdminDashboard />
    </Suspense>
  )
}
