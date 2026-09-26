'use client'

import { useEffect, useState } from 'react'
import { apiGet } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

type Fee = { id: number; month: string; amount: number; paid: boolean }
type Attendance = { status: string; notes: string | null; updated_at: string }
type Announcement = { id: number; title: string; body: string; announcement_type: string; created_at: string }

const statusLabels: Record<string, string> = {
  in_hostel: 'In hostel',
  away_home: 'Away home',
  medical_leave: 'Medical leave',
  outstation: 'Outstation',
}

export default function ParentPortalPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiGet('/api/fees'), apiGet('/api/attendance'), apiGet('/api/announcements')])
      .then(([feeData, attendanceData, announcementData]) => {
        setFees(feeData)
        setAttendance(attendanceData[0] || null)
        setAnnouncements(announcementData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-sm text-slate-500">Loading your portal...</p>

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Parent portal</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Your student&apos;s status</h1>
        <p className="mt-2 text-sm text-slate-500">View-only access to attendance and fee records.</p>
      </div>

      <Card>
        <CardHeader title="Current attendance" />
        <div className="p-6">
          {attendance ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{statusLabels[attendance.status] || attendance.status}</p>
                <p className="mt-1 text-sm text-slate-500">{attendance.notes || 'No note added'}</p>
              </div>
              <Badge tone={attendance.status === 'in_hostel' ? 'success' : 'warning'}>Updated {new Date(attendance.updated_at).toLocaleDateString()}</Badge>
            </div>
          ) : <p className="text-sm text-slate-500">No attendance record yet.</p>}
        </div>
      </Card>

      <Card>
        <CardHeader title="Announcements" />
        {announcements.length === 0 ? <p className="p-6 text-sm text-slate-500">No announcements yet.</p> : (
          <div className="divide-y divide-slate-100">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{announcement.title}</p>
                  <span className="text-xs text-slate-500">{new Date(announcement.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{announcement.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="Fee status" />
        {fees.length === 0 ? <p className="p-6 text-sm text-slate-500">No fee records yet.</p> : (
          <div className="divide-y divide-slate-100">
            {fees.map((fee) => (
              <div key={fee.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-medium text-slate-900">{fee.month}</p>
                  <p className="text-sm text-slate-500">Rs. {fee.amount}</p>
                </div>
                <Badge tone={fee.paid ? 'success' : 'danger'}>{fee.paid ? 'Paid' : 'Unpaid'}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}