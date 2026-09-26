'use client'

import { useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

const categories = [
  ['electricity', 'Electricity'],
  ['food', 'Food'],
  ['staff_salary', 'Staff salary'],
  ['maintenance', 'Maintenance'],
  ['water', 'Water'],
  ['internet', 'Internet'],
  ['supplies', 'Supplies'],
  ['other', 'Other'],
] as const

type Expense = {
  id: number
  category: string
  title: string
  amount: number
  expense_date: string
  payment_method: string
  vendor: string | null
  reference: string | null
  notes: string | null
}
type CategorySummary = { category: string; total: number; count: number }
type ExpenseResponse = { expenses: Expense[]; summary: { total: number; count: number }; categories: CategorySummary[] }

const initialForm = {
  category: 'electricity',
  title: '',
  amount: '',
  expenseDate: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  vendor: '',
  reference: '',
  notes: '',
}

function categoryLabel(value: string) {
  return categories.find(([key]) => key === value)?.[1] || value
}

export default function ExpensesPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [data, setData] = useState<ExpenseResponse>({ expenses: [], summary: { total: 0, count: 0 }, categories: [] })
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    try {
      setData(await apiGet(`/api/expenses?month=${month}`))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void apiGet(`/api/expenses?month=${month}`)
      .then(setData)
      .finally(() => setLoading(false))
  }, [month])

  async function addExpense(event: React.FormEvent) {
    event.preventDefault()
    try {
      await apiPost('/api/expenses', { ...form, amount: Number(form.amount) })
      setForm(initialForm)
      showToast('Expense recorded')
      loadData()
    } catch {
      showToast('Failed to record expense', 'error')
    }
  }

  async function removeExpense(id: number) {
    if (!window.confirm('Delete this expense record?')) return
    try {
      await apiDelete(`/api/expenses/${id}`)
      showToast('Expense deleted')
      loadData()
    } catch {
      showToast('Failed to delete expense', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-700">Operations</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Expense management</h1>
          <p className="mt-2 text-sm text-slate-500">Track hostel spending and monthly totals by category.</p>
        </div>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reporting month<input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="mt-1 block rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700" /></label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><div className="p-5"><p className="text-sm text-slate-500">Monthly total</p><p className="mt-2 text-3xl font-semibold text-slate-900">Rs. {Number(data.summary.total).toLocaleString()}</p></div></Card>
        <Card><div className="p-5"><p className="text-sm text-slate-500">Expense records</p><p className="mt-2 text-3xl font-semibold text-slate-900">{data.summary.count}</p></div></Card>
        <Card><div className="p-5"><p className="text-sm text-slate-500">Largest category</p><p className="mt-2 text-xl font-semibold text-slate-900">{data.categories[0] ? categoryLabel(data.categories[0].category) : 'None yet'}</p><p className="text-sm text-slate-500">{data.categories[0] ? `Rs. ${Number(data.categories[0].total).toLocaleString()}` : ''}</p></div></Card>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.6fr)]">
        <Card className="h-fit">
          <CardHeader title="Record expense" />
          <form onSubmit={addExpense} className="space-y-4 p-6">
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Category</label><select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{categories.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Description</label><input required placeholder="Electricity bill - main block" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-medium text-slate-500">Amount</label><input required min="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div><label className="mb-1 block text-xs font-medium text-slate-500">Date</label><input required type="date" value={form.expenseDate} onChange={(event) => setForm({ ...form, expenseDate: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div></div>
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Payment method</label><select value={form.paymentMethod} onChange={(event) => setForm({ ...form, paymentMethod: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="cash">Cash</option><option value="bank_transfer">Bank transfer</option><option value="esewa">eSewa</option><option value="khalti">Khalti</option><option value="card">Card</option></select></div>
            <div className="grid grid-cols-2 gap-3"><input placeholder="Vendor" value={form.vendor} onChange={(event) => setForm({ ...form, vendor: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><input placeholder="Bill/reference no." value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <textarea placeholder="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="min-h-20 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <Button type="submit" className="w-full">Save expense</Button>
          </form>
        </Card>

        <Card className="min-w-0 overflow-hidden">
          <CardHeader title="Monthly expense records" />
          {loading ? <div className="flex min-h-[260px] items-center justify-center p-6 text-sm text-slate-500">Loading expenses...</div> : data.expenses.length === 0 ? <div className="flex min-h-[260px] items-center justify-center p-6 text-center text-sm text-slate-500">No expenses recorded for this month.</div> : <div className="overflow-x-auto"><table className="min-w-[760px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3 text-left">Date</th><th className="px-6 py-3 text-left">Description</th><th className="px-6 py-3 text-left">Category</th><th className="px-6 py-3 text-left">Amount</th><th className="px-6 py-3 text-left">Method</th><th className="px-6 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{data.expenses.map((expense) => <tr key={expense.id}><td className="whitespace-nowrap px-6 py-4 text-slate-600">{new Date(expense.expense_date).toLocaleDateString()}</td><td className="px-6 py-4"><p className="font-medium text-slate-900">{expense.title}</p>{expense.vendor && <p className="text-xs text-slate-500">{expense.vendor}</p>}</td><td className="px-6 py-4"><Badge>{categoryLabel(expense.category)}</Badge></td><td className="px-6 py-4 font-medium text-slate-900">Rs. {Number(expense.amount).toLocaleString()}</td><td className="px-6 py-4 capitalize text-slate-600">{expense.payment_method.replace('_', ' ')}</td><td className="px-6 py-4 text-right"><Button variant="danger" onClick={() => removeExpense(expense.id)}>Delete</Button></td></tr>)}</tbody></table></div>}
        </Card>
      </div>

      <Card>
        <CardHeader title="Category totals" />
        <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">{data.categories.map((item) => <div key={item.category} className="rounded-xl border border-slate-200 p-4"><p className="text-sm font-medium text-slate-700">{categoryLabel(item.category)}</p><p className="mt-2 text-xl font-semibold text-slate-900">Rs. {Number(item.total).toLocaleString()}</p><p className="text-xs text-slate-500">{item.count} record{Number(item.count) === 1 ? '' : 's'}</p></div>)}</div>
      </Card>
    </div>
  )
}
