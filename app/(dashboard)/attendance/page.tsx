'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { UserCheck, ArrowUpRight, ArrowDownLeft, MapPin, ClipboardCheck, AlertCircle } from 'lucide-react'

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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
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
    void Promise.all([
      apiGet('/api/students'),
      apiGet('/api/attendance'),
    ]).then(([studentsData, attendanceData]) => {
      setStudents(studentsData)
      setRecords(attendanceData)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
      setError('Unable to load attendance records.')
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await apiPost('/api/attendance', {
        studentId: Number(form.studentId),
        status: form.status,
        notes: form.notes || undefined,
      })

      setForm({ studentId: '', status: 'away_home', notes: '' })
      await loadData()
    } catch {
      setError('Unable to save this status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <UserCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-emerald-700">Tracking</p>
          <h1 className="text-2xl font-semibold tracking-[-0.05em] text-slate-900 sm:text-3xl">Attendance & Leave</h1>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current records</p><p className="mt-1 text-2xl font-semibold text-slate-900">{records.length}</p><p className="mt-1 text-xs text-emerald-800/70">Students being tracked</p></div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-blue-700">In hostel</p><p className="mt-1 text-2xl font-semibold text-slate-900">{records.filter((record) => record.status === 'in_hostel').length}</p><p className="mt-1 text-xs text-blue-800/70">Currently on site</p></div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4 sm:p-5"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Away or leave</p><p className="mt-1 text-2xl font-semibold text-slate-900">{records.filter((record) => record.status !== 'in_hostel').length}</p><p className="mt-1 text-xs text-amber-800/70">Outside the hostel</p></div>
      </div>

      <Card>
        <CardHeader title="Record student status" action={<span className="text-xs text-slate-500">Update a student&apos;s current location</span>} />
        <form onSubmit={handleSubmit} className="grid gap-5 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1.2fr_auto] xl:items-end">
          <div className="min-w-0">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><ClipboardCheck className="h-3.5 w-3.5 text-emerald-600" />Student</label>
            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
              required
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.full_name}</option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500"><MapPin className="h-3.5 w-3.5 text-emerald-600" />Current status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
            >
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="min-w-0">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Note <span className="font-normal normal-case tracking-normal text-slate-400">(optional)</span></label>
            <input
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Reason / location"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-3 focus:ring-emerald-100"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-1">
            <Button type="submit" disabled={saving} className="h-11 w-full whitespace-nowrap">{saving ? 'Saving...' : 'Save status'}</Button>
          </div>
        </form>
        {error ? <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700 sm:px-6" role="alert"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div> : null}
      </Card>

      <Card>
        <CardHeader title="Current student status" action={<span className="text-xs text-slate-500">{records.length} tracked</span>} />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {records.map((record) => (
              <div key={record.id} className="flex flex-col gap-4 px-5 py-4 sm:px-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${record.status === 'in_hostel' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {record.status === 'in_hostel' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{record.full_name}</p>
                    <p className="text-xs text-slate-500">
                      {record.updated_at ? new Date(record.updated_at).toLocaleString() : 'Recently updated'}
                    </p>
                  </div>
                </div>

                <div className="flex min-w-0 flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3 md:justify-end">
                  <Badge tone={statusTone[record.status]}>{statusLabels[record.status]}</Badge>
                  <span className="max-w-full truncate text-sm text-slate-500" title={record.notes || 'No note added'}>{record.notes || 'No note added'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
