'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

type Fee = { id: number; student_id: number; full_name: string; month: string; amount: number; paid: boolean }
type Student = { id: number; full_name: string }

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ studentId: '', month: '', amount: '' })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    const [feesData, studentsData] = await Promise.all([apiGet('/api/fees'), apiGet('/api/students')])
    setFees(feesData)
    setStudents(studentsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/fees', { studentId: Number(form.studentId), month: form.month, amount: Number(form.amount) })
      setForm({ studentId: '', month: '', amount: '' })
      showToast('Fee record added')
      loadData()
    } catch {
      showToast('Failed to add fee record', 'error')
    }
  }

  async function togglePaid(fee: Fee) {
    try {
      await apiPut(`/api/fees/${fee.id}`, { paid: !fee.paid })
      showToast(fee.paid ? 'Marked as unpaid' : 'Marked as paid')
      loadData()
    } catch {
      showToast('Failed to update fee status', 'error')
    }
  }

  const visibleFees = fees.filter((f) => filter === 'all' || (filter === 'paid' ? f.paid : !f.paid))

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Fees</h1>

      <Card className="mb-6">
        <CardHeader title="Record New Fee" />
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Student</label>
            <select className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
              <option value="">Select student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Month (e.g. 2026-09)</label>
            <input className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Amount (Rs.)</label>
            <input type="number" className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <Button type="submit">Add Fee</Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Fee Records"
          action={
            <div className="flex gap-1 text-xs">
              {(['all', 'unpaid', 'paid'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-md font-medium capitalize ${filter === f ? 'bg-blue-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          }
        />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : visibleFees.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No fee records found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Student</th>
                <th className="text-left px-6 py-3 font-medium">Month</th>
                <th className="text-left px-6 py-3 font-medium">Amount</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleFees.map((f) => (
                <tr key={f.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">{f.full_name}</td>
                  <td className="px-6 py-3 text-slate-600">{f.month}</td>
                  <td className="px-6 py-3 text-slate-600">Rs. {f.amount}</td>
                  <td className="px-6 py-3"><Badge tone={f.paid ? 'success' : 'danger'}>{f.paid ? 'Paid' : 'Unpaid'}</Badge></td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="secondary" onClick={() => togglePaid(f)}>
                      {f.paid ? 'Mark Unpaid' : 'Mark Paid'}
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