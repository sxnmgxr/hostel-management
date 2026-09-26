'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

type LaundryLog = { id: number; student_id: number; full_name: string; item_count: number; date_sent: string; returned: boolean }
type Student = { id: number; full_name: string }

export default function LaundryPage() {
  const [logs, setLogs] = useState<LaundryLog[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ studentId: '', itemCount: '' })
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    const [logsData, studentsData] = await Promise.all([apiGet('/api/laundry'), apiGet('/api/students')])
    setLogs(logsData)
    setStudents(studentsData)
    setLoading(false)
  }

  useEffect(() => { void Promise.resolve().then(loadData) }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/laundry', { studentId: Number(form.studentId), itemCount: Number(form.itemCount) })
      setForm({ studentId: '', itemCount: '' })
      showToast('Laundry log recorded')
      loadData()
    } catch {
      showToast('Failed to record laundry log', 'error')
    }
  }

  async function toggleReturned(log: LaundryLog) {
    try {
      await apiPut(`/api/laundry/${log.id}`, { returned: !log.returned })
      showToast(log.returned ? 'Marked as pending' : 'Marked as returned')
      loadData()
    } catch {
      showToast('Failed to update status', 'error')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Laundry</h1>

      <Card className="mb-6">
        <CardHeader title="Log New Laundry Batch" />
        <form onSubmit={handleAdd} className="p-6 flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Student</label>
            <select className="border border-slate-300 rounded-md px-3 py-2 text-sm w-56" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Item Count</label>
            <input type="number" className="border border-slate-300 rounded-md px-3 py-2 text-sm w-28" value={form.itemCount} onChange={(e) => setForm({ ...form, itemCount: e.target.value })} required />
          </div>
          <Button type="submit">Log Batch</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Laundry Log" />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : logs.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No laundry logs yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Student</th>
                <th className="text-left px-6 py-3 font-medium">Date Sent</th>
                <th className="text-left px-6 py-3 font-medium">Items</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{l.full_name}</td>
                  <td className="px-6 py-3 text-slate-600">{new Date(l.date_sent).toLocaleDateString()}</td>
                  <td className="px-6 py-3 text-slate-600">{l.item_count}</td>
                  <td className="px-6 py-3"><Badge tone={l.returned ? 'success' : 'warning'}>{l.returned ? 'Returned' : 'Pending'}</Badge></td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="secondary" onClick={() => toggleReturned(l)}>
                      {l.returned ? 'Mark Pending' : 'Mark Returned'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}