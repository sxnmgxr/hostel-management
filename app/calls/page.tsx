'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { CheckCircle2, CircleDashed, Phone, Trash2, UserRound, Clock3 } from 'lucide-react'

type CallLog = {
  id: number
  student_id: number
  full_name: string
  called_by: string
  call_date: string
  purpose: string
  outcome: string
  notes: string | null
  follow_up_needed: boolean
  follow_up_date: string | null
}
type Student = { id: number; full_name: string }

const purposeLabels: Record<string, string> = {
  fee_reminder: 'Fee Reminder',
  general_update: 'General Update',
  complaint: 'Complaint',
  emergency: 'Emergency',
  other: 'Other',
}

const outcomeLabels: Record<string, string> = {
  answered: 'Answered',
  no_answer: 'No Answer',
  voicemail: 'Voicemail',
  switched_off: 'Switched Off',
}

const outcomeTone: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  answered: 'success',
  no_answer: 'warning',
  voicemail: 'neutral',
  switched_off: 'danger',
}

export default function CallsPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCallId, setSelectedCallId] = useState<number | null>(null)
  const [form, setForm] = useState({
    studentId: '', calledBy: '', purpose: 'fee_reminder', outcome: 'answered',
    notes: '', followUpNeeded: false, followUpDate: '',
  })
  const { showToast } = useToast()

  const summary = useMemo(() => ({
    total: calls.length,
    answered: calls.filter((call) => call.outcome === 'answered').length,
    followUps: calls.filter((call) => call.follow_up_needed).length,
  }), [calls])

  const selectedCall = calls.find((call) => call.id === selectedCallId) ?? calls[0] ?? null

  async function loadData() {
    setLoading(true)
    const [callsData, studentsData] = await Promise.all([apiGet('/api/calls'), apiGet('/api/students')])
    setCalls(callsData)
    setStudents(studentsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (!selectedCallId && calls.length > 0) {
      setSelectedCallId(calls[0].id)
    }
  }, [calls, selectedCallId])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/calls', {
        studentId: Number(form.studentId),
        calledBy: form.calledBy,
        purpose: form.purpose,
        outcome: form.outcome,
        notes: form.notes || undefined,
        followUpNeeded: form.followUpNeeded,
        followUpDate: form.followUpDate || undefined,
      })
      setForm({ studentId: '', calledBy: '', purpose: 'fee_reminder', outcome: 'answered', notes: '', followUpNeeded: false, followUpDate: '' })
      showToast('Call log recorded')
      loadData()
    } catch {
      showToast('Failed to record call', 'error')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this call log?')) return
    await apiDelete(`/api/calls/${id}`)
    showToast('Call log deleted')
    loadData()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Communication</p>
            <h1 className="text-3xl font-bold text-slate-900">Parent Call Log</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Total calls</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">{summary.total}</span>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Answered</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-emerald-700">{summary.answered}</span>
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Needs follow-up</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-700">{summary.followUps}</span>
              <Clock3 className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Log a Call" />
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Student</label>
            <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Called By</label>
            <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" placeholder="Your name" value={form.calledBy} onChange={(e) => setForm({ ...form, calledBy: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Purpose</label>
            <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}>
              {Object.entries(purposeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Outcome</label>
            <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}>
              {Object.entries(outcomeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Notes</label>
            <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" placeholder="What was discussed..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 pt-8">
            <input type="checkbox" id="followUp" checked={form.followUpNeeded} onChange={(e) => setForm({ ...form, followUpNeeded: e.target.checked })} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
            <label htmlFor="followUp" className="text-sm font-medium text-slate-700">Needs follow-up</label>
          </div>
          {form.followUpNeeded && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Follow-up Date</label>
              <input type="date" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-400 focus:ring-3 focus:ring-blue-100" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
            </div>
          )}
          <div className="lg:col-span-3">
            <Button type="submit" className="w-fit">Log Call</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader title="Call History" />

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : calls.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No calls logged yet.</p>
        ) : (
          <div className="p-6">
            <div className="space-y-3">
              {calls.map((call) => {
                const isSelected = selectedCall?.id === call.id
                return (
                  <button
                    key={call.id}
                    type="button"
                    onClick={() => setSelectedCallId(call.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-200 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{call.full_name}</p>
                          <p className="text-xs text-slate-500">{new Date(call.call_date).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={outcomeTone[call.outcome] ?? 'neutral'}>{outcomeLabels[call.outcome]}</Badge>
                        <span className="text-xs font-medium text-slate-500">{purposeLabels[call.purpose]}</span>
                        {call.follow_up_needed && <Badge tone="danger">Follow-up</Badge>}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {selectedCall && (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Call details</p>
                    <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedCall.full_name}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedCall.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <p className="text-slate-500">Called by</p>
                    <p className="mt-1 font-semibold text-slate-900">{selectedCall.called_by}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <p className="text-slate-500">Purpose</p>
                    <p className="mt-1 font-semibold text-slate-900">{purposeLabels[selectedCall.purpose]}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 border border-slate-200">
                    <p className="text-slate-500">Follow-up</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedCall.follow_up_needed
                        ? selectedCall.follow_up_date
                          ? new Date(selectedCall.follow_up_date).toLocaleDateString()
                          : 'Required'
                        : 'Not needed'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white p-4 border border-slate-200">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Conversation notes</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {selectedCall.notes || 'No detailed notes were recorded for this call.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}