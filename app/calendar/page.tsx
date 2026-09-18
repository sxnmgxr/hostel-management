'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGet } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { CalendarDays, Clock3 } from 'lucide-react'

type CalendarItem = {
  id: number
  title: string
  date: string
  type: 'fee' | 'laundry' | 'call' | 'leave'
}

export default function CalendarPage() {
  const [items, setItems] = useState<CalendarItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCalendar() {
      const [fees, laundry, calls, attendance] = await Promise.all([
        apiGet('/api/fees'),
        apiGet('/api/laundry'),
        apiGet('/api/calls'),
        apiGet('/api/attendance'),
      ])

      const mapped: CalendarItem[] = [
        ...fees.map((fee: any) => ({ id: fee.id, title: `Fee due: ${fee.student_name || 'Student'}`, date: fee.paid_on || fee.month || new Date().toISOString(), type: 'fee' as const })),
        ...laundry.map((item: any) => ({ id: item.id, title: `Laundry: ${item.student_name || 'Student'}`, date: item.date_sent || new Date().toISOString(), type: 'laundry' as const })),
        ...calls.map((call: any) => ({ id: call.id, title: `Call: ${call.full_name || 'Student'}`, date: call.call_date || new Date().toISOString(), type: 'call' as const })),
        ...attendance.map((item: any) => ({ id: item.id, title: `${item.full_name || 'Student'}: ${item.status}`, date: item.updated_at || new Date().toISOString(), type: 'leave' as const })),
      ]

      setItems(mapped)
      setLoading(false)
    }

    loadCalendar()
  }, [])

  const grouped = useMemo(() => {
    return items.reduce<Record<string, CalendarItem[]>>((acc, item) => {
      const key = new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      acc[key] = acc[key] ? [...acc[key], item] : [item]
      return acc
    }, {})
  }, [items])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
          <CalendarDays className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-700">Planning</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Calendar</h1>
        </div>
      </div>

      <Card>
        <CardHeader title="Upcoming activity" />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading calendar...</p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No calendar items yet.</p>
        ) : (
          <div className="space-y-6 p-6">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Clock3 className="h-4 w-4 text-slate-400" />
                  {date}
                </div>
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div key={`${date}-${entry.id}-${entry.title}`} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">{entry.title}</p>
                        <p className="text-xs text-slate-500">{entry.type}</p>
                      </div>
                      <Badge tone={entry.type === 'leave' ? 'warning' : entry.type === 'fee' ? 'danger' : 'neutral'}>
                        {entry.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
