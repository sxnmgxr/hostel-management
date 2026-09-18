'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { StatCard } from '@/components/ui/StatCard'
import { Card, CardHeader } from '@/components/ui/Card'
import { FeeTrendChart } from '@/components/charts/FeeTrendChart'
import { OccupancyChart } from '@/components/charts/OccupancyChart'
import { Users, DoorOpen, Receipt, Shirt, Phone, ArrowRight, Bell, SlidersHorizontal } from 'lucide-react'

type Stats = {
  totalStudents: number
  totalRooms: number
  unpaidFeesCount: number
  unpaidFeesTotal: number
  pendingLaundryCount: number
  pendingFollowUps: number
  feeTrend: { month: string; collected: number; pending: number }[]
  occupancy: { room: string; capacity: number; occupied: number }[]
  recentActivity: { type: string; date: string; studentName: string; description: string }[]
}

const activityIcons: Record<string, any> = {
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

  useEffect(() => {
    apiGet('/api/dashboard').then(setStats)
  }, [])

  const overviewStats = [
    { label: 'Active Students', value: stats?.totalStudents ?? '—', icon: Users },
    { label: 'Total Rooms', value: stats?.totalRooms ?? '—', icon: DoorOpen },
    { label: 'Unpaid Fees', value: stats ? `Rs. ${stats.unpaidFeesTotal}` : '—', icon: Receipt, tone: 'danger' as const },
    { label: 'Pending Laundry', value: stats?.pendingLaundryCount ?? '—', icon: Shirt, tone: 'warning' as const },
    { label: 'Follow-ups Due', value: stats?.pendingFollowUps ?? '—', icon: Phone, tone: 'warning' as const },
  ]

  return (
    <div className="space-y-6">
      <header className="rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">Operations overview</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-slate-900">Dashboard</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
              <Bell className="h-4 w-4" />
              Updates
            </button>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              Updated today
            </div>
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">
        {overviewStats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} icon={item.icon} tone={item.tone} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.8fr_1fr]">
        <Card className="h-full overflow-hidden">
          <CardHeader title="Fee Collection — Last 6 Months" />
          <div className="flex h-[calc(100%-73px)] items-center p-5">
            {stats && stats.feeTrend.length > 0 ? (
              <div className="h-[280px] w-full">
                <FeeTrendChart data={stats.feeTrend} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">No fee data yet.</p>
            )}
          </div>
        </Card>

        <Card className="h-full overflow-hidden">
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
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-5 2xl:grid-cols-[1.8fr_1fr]">
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
      </section>
    </div>
  )
}