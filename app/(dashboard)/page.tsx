'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { FeeTrendChart } from '@/components/charts/FeeTrendChart'
import { OccupancyChart } from '@/components/charts/OccupancyChart'
import { ExpenseCategoryChart } from '@/components/charts/ExpenseCategoryChart'
import type { LucideIcon } from 'lucide-react'
import { Users, DoorOpen, Receipt, Shirt, Phone, ArrowRight, Bell, SlidersHorizontal, WalletCards, Megaphone, AlertTriangle, BedDouble, RefreshCw, CheckCircle2 } from 'lucide-react'

type Stats = {
  totalStudents: number
  totalRooms: number
  unpaidFeesCount: number
  unpaidFeesTotal: number
  pendingLaundryCount: number
  pendingFollowUps: number
  monthlyExpenses: number
  expectedFees: number
  collectedFees: number
  overdueFeesCount: number
  overdueFeesTotal: number
  recentAnnouncements: number
  attendanceSummary: { status: string; count: number }[]
  expenseCategories: { category: string; total: number }[]
  feeTrend: { month: string; collected: number; pending: number }[]
  occupancy: { room: string; capacity: number; occupied: number }[]
  recentActivity: { type: string; date: string; studentName: string; description: string }[]
}

type DashboardFilter = 'all' | 'financial' | 'occupancy' | 'attention'

const activityIcons: Record<string, LucideIcon> = {
  fee: Receipt,
  laundry: Shirt,
  call: Phone,
}

const quickActions = [
  { href: '/students', label: 'Manage Students' },
  { href: '/fees', label: 'Review Unpaid Fees' },
  { href: '/laundry', label: 'Track Laundry' },
  { href: '/calls', label: 'Log a Parent Call' },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState<DashboardFilter>('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [updatesOpen, setUpdatesOpen] = useState(false)
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null)

  async function loadDashboard() {
    setLoading(true)
    setError(false)
    try {
      setStats(await apiGet('/api/dashboard'))
      setRefreshedAt(new Date())
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void apiGet('/api/dashboard')
      .then((data) => {
        setStats(data)
        setRefreshedAt(new Date())
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value: number) => `Rs. ${value.toLocaleString()}`
  const totalBeds = stats?.occupancy.reduce((sum, room) => sum + room.capacity, 0) ?? 0
  const occupiedBeds = stats?.occupancy.reduce((sum, room) => sum + room.occupied, 0) ?? 0
  const availableBeds = Math.max(totalBeds - occupiedBeds, 0)
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
  const feeRange = stats?.feeTrend.length === 1 ? stats.feeTrend[0].month : `Last ${stats?.feeTrend.length ?? 0} Months`

  const overviewStats = [
    { label: 'Active Students', value: stats?.totalStudents ?? '—', detail: 'Currently active', icon: Users, href: '/students', category: 'occupancy' as const },
    { label: 'Rooms', value: stats ? `${stats.occupancy.filter((room) => room.occupied > 0).length} / ${stats.totalRooms}` : '—', detail: `${occupiedBeds} beds occupied`, icon: DoorOpen, href: '/rooms', category: 'occupancy' as const },
    { label: 'Available Beds', value: stats ? availableBeds : '—', detail: stats ? `${occupancyRate}% occupancy` : 'Loading...', icon: BedDouble, href: '/rooms', category: 'occupancy' as const },
    { label: 'Unpaid Fees', value: stats ? formatCurrency(stats.unpaidFeesTotal) : '—', detail: stats ? `${stats.overdueFeesCount} overdue` : 'Loading...', icon: Receipt, tone: 'danger' as const, href: '/fees', category: 'financial' as const },
    { label: 'Pending Laundry', value: stats?.pendingLaundryCount ?? '—', detail: 'Awaiting completion', icon: Shirt, tone: 'warning' as const, href: '/laundry', category: 'attention' as const },
    { label: 'Follow-ups Due', value: stats?.pendingFollowUps ?? '—', detail: 'Requires attention', icon: Phone, tone: 'warning' as const, href: '/calls', category: 'attention' as const },
    { label: 'Monthly Expenses', value: stats ? formatCurrency(stats.monthlyExpenses) : '—', detail: 'This month', icon: WalletCards, category: 'financial' as const },
  ]
  const visibleOverviewStats = overviewStats.filter((item) => filter === 'all' || item.category === filter)
  const showSection = (category: Exclude<DashboardFilter, 'all'>) => filter === 'all' || filter === category
  const filterLabels: Record<DashboardFilter, string> = { all: 'All metrics', financial: 'Financial', occupancy: 'Occupancy', attention: 'Needs attention' }

  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">Operations overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Dashboard</h1>
          </div>

          <div className="relative flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <button onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <SlidersHorizontal className="h-4 w-4" />
              {filter === 'all' ? 'Filter' : filterLabels[filter]}
              </button>
              {filterOpen ? <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl" role="menu">
                {(Object.keys(filterLabels) as DashboardFilter[]).map((option) => <button key={option} onClick={() => { setFilter(option); setFilterOpen(false) }} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${filter === option ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`} role="menuitem">
                  {filterLabels[option]} {filter === option ? <CheckCircle2 className="h-4 w-4" /> : null}
                </button>)}
              </div> : null}
            </div>
            <button onClick={() => setUpdatesOpen((open) => !open)} aria-expanded={updatesOpen} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              Updates {stats?.recentActivity.length ? <span className="rounded-full bg-blue-100 px-1.5 text-xs text-blue-700">{stats.recentActivity.length}</span> : null}
            </button>
            {updatesOpen ? <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2"><p className="text-sm font-semibold text-slate-900">Latest updates</p><button onClick={loadDashboard} className="text-xs font-medium text-blue-700 hover:text-blue-800">Refresh</button></div>
              {stats?.recentActivity.length ? <div className="divide-y divide-slate-100">{stats.recentActivity.slice(0, 4).map((activity, index) => <div key={`${activity.date}-${index}`} className="py-2"><p className="text-xs text-slate-700"><span className="font-semibold">{activity.studentName}</span> — {activity.description}</p><p className="mt-1 text-[11px] text-slate-400">{new Date(activity.date).toLocaleString()}</p></div>)}</div> : <p className="py-3 text-xs text-slate-500">No recent updates.</p>}
            </div> : null}
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              {loading ? 'Refreshing...' : refreshedAt ? `Updated today · ${refreshedAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}` : 'Not updated'}
            </div>
          </div>
        </div>
      </header>

      {error ? (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <span>Unable to load dashboard data.</span>
          <button onClick={loadDashboard} className="inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 font-medium hover:bg-rose-100"><RefreshCw className="h-4 w-4" /> Retry</button>
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        {visibleOverviewStats.map((item) => (
          <StatCard key={item.label} label={item.label} value={loading ? '...' : item.value} detail={loading ? 'Loading...' : item.detail} icon={item.icon} tone={item.tone} href={item.href} />
        ))}
      </section>

      {showSection('financial') || showSection('occupancy') ? <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.8fr_1fr]">
        {showSection('financial') ?
        <Card className="h-full overflow-hidden">
          <CardHeader title={`Fee Collection — ${feeRange}`} />
          <div className="flex h-[calc(100%-73px)] items-center p-5">
            {stats && stats.feeTrend.length > 0 ? (
              <div className="h-[280px] w-full">
                <FeeTrendChart data={stats.feeTrend} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No fee data recorded yet.</p>
            )}
          </div>
        </Card> : null}

        {showSection('occupancy') ? <Card className="h-full overflow-hidden">
          <CardHeader title="Room Occupancy" />
          <div className="flex h-[calc(100%-73px)] items-center justify-center p-5">
            {stats && stats.occupancy.length > 0 ? (
              <div className="h-[280px] w-full">
                <OccupancyChart data={stats.occupancy} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No rooms added yet.</p>
            )}
          </div>
        </Card> : null}
      </section>
      : null}

      {showSection('financial') || showSection('occupancy') || showSection('attention') ? <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr_1fr]">
        {showSection('financial') ? <Card className="overflow-hidden">
          <CardHeader title="Expense mix this month" />
          <div className="p-4">
            {stats && stats.expenseCategories.length > 1 ? <div className="grid items-center gap-3 sm:grid-cols-[1fr_150px]"><ExpenseCategoryChart data={stats.expenseCategories} /><div className="space-y-2">{stats.expenseCategories.slice(0, 5).map((item) => <div key={item.category} className="flex items-center justify-between gap-3 text-xs"><span className="capitalize text-slate-600">{item.category.replace('_', ' ')}</span><span className="font-semibold text-slate-900">{formatCurrency(item.total)}</span></div>)}</div></div> : stats?.expenseCategories.length === 1 ? <div className="space-y-3 p-2"><div className="flex items-center justify-between"><span className="capitalize text-sm font-medium text-slate-700">{stats.expenseCategories[0].category.replace('_', ' ')}</span><span className="font-semibold text-slate-900">{formatCurrency(stats.expenseCategories[0].total)}</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-full rounded-full bg-blue-600" /></div><p className="text-right text-xs text-slate-500">100% of monthly expenses</p></div> : <p className="p-4 text-sm text-slate-500">No expenses recorded this month.</p>}
          </div>
        </Card> : null}

        {showSection('occupancy') ? <Card className="overflow-hidden">
          <CardHeader title="Attendance pulse" />
          <div className="space-y-3 p-5">
            {stats && stats.attendanceSummary.length > 0 ? <><div className="space-y-3">{stats.attendanceSummary.map((item) => <div key={item.status}><div className="mb-1 flex justify-between text-xs"><span className="capitalize text-slate-600">{item.status.replace('_', ' ')}</span><span className="font-semibold text-slate-900">{item.count}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${Math.min((item.count / Math.max(stats.totalStudents, 1)) * 100, 100)}%` }} /></div></div>)}</div><p className="border-t border-slate-100 pt-3 text-xs font-medium text-slate-500">Total tracked: {stats.attendanceSummary.reduce((sum, item) => sum + item.count, 0)}</p></> : <p className="text-sm text-slate-500">No attendance records yet.</p>}
          </div>
        </Card> : null}

        {showSection('attention') ? <Card className="overflow-hidden">
          <CardHeader title="Needs attention" />
          <div className="space-y-3 p-5">
            <Link href="/fees" className="flex items-center justify-between rounded-xl bg-rose-50 p-3"><span className="flex items-center gap-2 text-sm text-rose-800"><AlertTriangle className="h-4 w-4" />Overdue fees</span><span className="font-semibold text-rose-900">{stats?.overdueFeesCount ?? '—'}</span></Link>
            <Link href="/communications" className="flex items-center justify-between rounded-xl bg-cyan-50 p-3"><span className="flex items-center gap-2 text-sm text-cyan-800"><Megaphone className="h-4 w-4" />Recent notices</span><span className="font-semibold text-cyan-900">{stats?.recentAnnouncements ?? '—'}</span></Link>
            <Link href="/laundry" className="flex items-center justify-between rounded-xl bg-amber-50 p-3"><span className="flex items-center gap-2 text-sm text-amber-800"><Shirt className="h-4 w-4" />Pending laundry</span><span className="font-semibold text-amber-900">{stats?.pendingLaundryCount ?? '—'}</span></Link>
            <Link href="/calls" className="flex items-center justify-between rounded-xl bg-blue-50 p-3"><span className="flex items-center gap-2 text-sm text-blue-800"><Phone className="h-4 w-4" />Follow-ups due</span><span className="font-semibold text-blue-900">{stats?.pendingFollowUps ?? '—'}</span></Link>
          </div>
        </Card> : null}
      </section>
      : null}

      {showSection('financial') || showSection('occupancy') ? <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {showSection('financial') ? <Card>
          <CardHeader title="Financial overview" />
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
            {[['Expected fees', stats?.expectedFees], ['Collected', stats?.collectedFees], ['Pending', stats ? stats.expectedFees - stats.collectedFees : undefined], ['Expenses', stats?.monthlyExpenses]].map(([label, value]) => <div key={label as string}><p className="text-xs text-slate-500">{label as string}</p><p className="mt-1 text-lg font-semibold text-slate-900">{value === undefined ? '—' : formatCurrency(value as number)}</p></div>)}
          </div>
        </Card> : null}
        {showSection('occupancy') ? <Card>
          <CardHeader title="Operational snapshot" />
          <div className="grid grid-cols-2 gap-4 p-5 text-sm"><div><p className="text-xs text-slate-500">Beds available</p><p className="mt-1 font-semibold text-emerald-700">{stats ? availableBeds : '—'}</p></div><div><p className="text-xs text-slate-500">Overdue fees</p><p className="mt-1 font-semibold text-rose-700">{stats ? stats.overdueFeesCount : '—'}</p></div></div>
        </Card> : null}
      </section>
      : null}

      {showSection('attention') ? <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.8fr_1fr]">
        <Card className="overflow-hidden">
          <CardHeader title="Recent Activity" />
          {!stats || stats.recentActivity.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentActivity.map((a, i) => {
                const Icon = activityIcons[a.type] || Receipt
                return (
                  <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="mt-0.5 rounded-xl bg-slate-100 p-2 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{a.studentName}</span> — {a.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{new Date(a.date).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        <Card className="overflow-hidden">
          <CardHeader title="Quick Actions" />
          <div className="flex flex-col gap-2.5 p-4">
            {quickActions.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 transition-all hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-blue-700" />
              </Link>
            ))}
          </div>
        </Card>
      </section> : null}
    </div>
  )
}