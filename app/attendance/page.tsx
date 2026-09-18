'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserCheck, Home, ArrowUpRight, ArrowDownLeft } from 'lucide-react'

type Student = { id: number; full_name: string }
type AttendanceRecord = {
  id: number
  student_id: number
  full_name: string
  status: 'in_hostel' | 'away_home' | 'medical_leave' | 'outstation'
  check_in: string | null
  check_out: string | null
  notes: string | null
  updated_at: string
}

const statusLabels = {
  in_hostel: 'In Hostel',
  away_home: 'Went Home',
  medical_leave: 'Medical Leave',
  outstation: 'Outstation',
}

const statusTone = {
  in_hostel: 'success',
  away_home: 'warning',
  medical_leave: 'neutral',
  outstation: 'danger',
} as const

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    studentId: '',
    status: 'away_home',
    notes: '',
  })

  async function loadData() {
    setLoading(true)
    const [studentsData, attendanceData] = await Promise.all([
      apiGet('/api/students'),
      apiGet('/api/attendance'),
    ])
    setStudents(studentsData)
    setRecords(attendanceData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await apiPost('/api/attendance', {
      studentId: Number(form.studentId),
      status: form.status,
      notes: form.notes || undefined,
    })

    setForm({ studentId: '', status: 'away_home', notes: '' })
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Tracking</p>
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Attendance & Leave</h1>
        </div>
      </div>

      <Card>
        <CardHeader title="Record student status" />
        <form onSubmit={handleSubmit} className="grid gap-4 p-6 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.full_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Reason / location"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
            />
          </div>

          <div className="md:col-span-3">
            <Button type="submit">Save status</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Current student status" />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div key={record.id} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    {record.status === 'in_hostel' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{record.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {record.updated_at ? new Date(record.updated_at).toLocaleString() : 'Recently updated'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={statusTone[record.status]}>{statusLabels[record.status]}</Badge>
                  <span className="text-sm text-slate-500">{record.notes || 'No note added'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
