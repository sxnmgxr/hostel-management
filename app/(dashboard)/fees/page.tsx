'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

type Fee = { id: number; student_id: number; full_name: string; month: string; amount: number; paid: boolean; due_date: string | null; payment_method: string; receipt_number: string | null }
type Student = { id: number; full_name: string }
type FeeStructure = { id: number; name: string; room_type: string | null; student_id: number | null; student_name: string | null; monthly_amount: number; due_day: number; active: boolean }
type Reminder = { id: number; full_name: string; month: string; amount: number; notice: string }

export default function FeesPage() {
  const [fees, setFees] = useState<Fee[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState({ studentId: '', month: '', amount: '', dueDate: '' })
  const [structureForm, setStructureForm] = useState({ name: '', roomType: '', studentId: '', monthlyAmount: '', dueDay: '10' })
  const [structures, setStructures] = useState<FeeStructure[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7))
  const [paymentMethods, setPaymentMethods] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all')
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    const [feesData, studentsData, structuresData, remindersData] = await Promise.all([
      apiGet('/api/fees'), apiGet('/api/students'), apiGet('/api/fee-structures'), apiGet('/api/fees/reminders'),
    ])
    setFees(feesData)
    setStudents(studentsData)
    setStructures(structuresData)
    setReminders(remindersData)
    setLoading(false)
  }

  useEffect(() => { void Promise.resolve().then(loadData) }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/fees', { studentId: Number(form.studentId), month: form.month, amount: Number(form.amount), dueDate: form.dueDate || undefined })
      setForm({ studentId: '', month: '', amount: '', dueDate: '' })
      showToast('Fee record added')
      loadData()
    } catch {
      showToast('Failed to add fee record', 'error')
    }
  }

  async function togglePaid(fee: Fee) {
    try {
      await apiPut(`/api/fees/${fee.id}`, { paid: !fee.paid, paymentMethod: paymentMethods[fee.id] || fee.payment_method || 'cash' })
      showToast(fee.paid ? 'Marked as unpaid' : 'Marked as paid')
      loadData()
    } catch {
      showToast('Failed to update fee status', 'error')
    }
  }

  async function createStructure(event: React.FormEvent) {
    event.preventDefault()
    await apiPost('/api/fee-structures', {
      name: structureForm.name,
      roomType: structureForm.roomType || undefined,
      studentId: structureForm.studentId ? Number(structureForm.studentId) : null,
      monthlyAmount: Number(structureForm.monthlyAmount),
      dueDay: Number(structureForm.dueDay),
    })
    setStructureForm({ name: '', roomType: '', studentId: '', monthlyAmount: '', dueDay: '10' })
    loadData()
  }

  async function generateFees() {
    await apiPost('/api/fees/generate', { month: generateMonth })
    loadData()
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
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Due date</label>
            <input type="date" className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <Button type="submit">Add Fee</Button>
        </form>
      </Card>

      <div className="grid gap-6 mb-6 xl:grid-cols-2">
        <Card>
          <CardHeader title="Monthly fee structures" />
          <form onSubmit={createStructure} className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
            <input required placeholder="Structure name" className="border border-slate-300 rounded-md px-3 py-2 text-sm" value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })} />
            <input placeholder="Room type (blank = default)" className="border border-slate-300 rounded-md px-3 py-2 text-sm" value={structureForm.roomType} onChange={(e) => setStructureForm({ ...structureForm, roomType: e.target.value })} />
            <select className="border border-slate-300 rounded-md px-3 py-2 text-sm" value={structureForm.studentId} onChange={(e) => setStructureForm({ ...structureForm, studentId: e.target.value })}>
              <option value="">All matching students</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}
            </select>
            <input required type="number" min="1" placeholder="Monthly amount" className="border border-slate-300 rounded-md px-3 py-2 text-sm" value={structureForm.monthlyAmount} onChange={(e) => setStructureForm({ ...structureForm, monthlyAmount: e.target.value })} />
            <input required type="number" min="1" max="28" placeholder="Due day" className="border border-slate-300 rounded-md px-3 py-2 text-sm" value={structureForm.dueDay} onChange={(e) => setStructureForm({ ...structureForm, dueDay: e.target.value })} />
            <Button type="submit">Save structure</Button>
          </form>
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {structures.map((structure) => <div key={structure.id} className="flex items-center justify-between px-6 py-3 text-sm"><span className="font-medium text-slate-800">{structure.name}</span><span className="text-slate-500">Rs. {structure.monthly_amount} · day {structure.due_day}</span></div>)}
          </div>
        </Card>

        <Card>
          <CardHeader title="Generate monthly fees" />
          <div className="flex flex-wrap items-end gap-3 p-6">
            <label className="text-xs font-medium text-slate-500">Month<input type="month" className="mt-1 block border border-slate-300 rounded-md px-3 py-2 text-sm" value={generateMonth} onChange={(e) => setGenerateMonth(e.target.value)} /></label>
            <Button onClick={generateFees}>Generate pending fees</Button>
          </div>
          <div className="border-t border-slate-100 p-6">
            <p className="mb-3 text-sm font-semibold text-slate-800">Nepali reminders ({reminders.length})</p>
            <div className="max-h-40 space-y-2 overflow-auto text-xs text-slate-600">
              {reminders.slice(0, 5).map((reminder) => <p key={reminder.id} className="rounded bg-amber-50 p-2">{reminder.notice}</p>)}
              {reminders.length === 0 && <p>No pending reminders.</p>}
            </div>
          </div>
        </Card>
      </div>

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
                <th className="text-left px-6 py-3 font-medium">Payment</th>
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
                  <td className="px-6 py-3">
                    {f.paid ? <span className="text-xs text-slate-500">{f.payment_method || 'cash'}</span> : <select className="rounded border border-slate-300 px-2 py-1 text-xs" value={paymentMethods[f.id] || 'cash'} onChange={(e) => setPaymentMethods({ ...paymentMethods, [f.id]: e.target.value })}><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="esewa">eSewa</option><option value="khalti">Khalti</option><option value="card">Card</option></select>}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => togglePaid(f)}>{f.paid ? 'Mark Unpaid' : 'Mark Paid'}</Button>{f.paid && <a className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50" href={`/api/fees/${f.id}/receipt`}>Receipt PDF</a>}</div>
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