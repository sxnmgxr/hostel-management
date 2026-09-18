'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function StudentDetailPage() {
  const params = useParams()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet(`/api/students/${params.id}`).then((data) => {
      setStudent(data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>
  if (!student) return <p className="text-sm text-slate-500">Student not found.</p>

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{student.full_name}</h1>
      <p className="text-sm text-slate-500 mt-1">
        Guardian: {student.guardian_name} · {student.guardian_phone}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader title="Fee History" />
          {student.fees.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No fee records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Month</th>
                  <th className="text-left px-6 py-3 font-medium">Amount</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.fees.map((f: any) => (
                  <tr key={f.id}>
                    <td className="px-6 py-3">{f.month}</td>
                    <td className="px-6 py-3">Rs. {f.amount}</td>
                    <td className="px-6 py-3">
                      <Badge tone={f.paid ? 'success' : 'danger'}>{f.paid ? 'Paid' : 'Unpaid'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="Laundry History" />
          {student.laundryLogs.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No laundry records.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Date</th>
                  <th className="text-left px-6 py-3 font-medium">Items</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.laundryLogs.map((l: any) => (
                  <tr key={l.id}>
                    <td className="px-6 py-3">{new Date(l.date_sent).toLocaleDateString()}</td>
                    <td className="px-6 py-3">{l.item_count}</td>
                    <td className="px-6 py-3">
                      <Badge tone={l.returned ? 'success' : 'warning'}>{l.returned ? 'Returned' : 'Pending'}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <CardHeader title="Call History" />
          {student.calls.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">No calls logged.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {student.calls.map((c: any) => (
                <div key={c.id} className="px-6 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(c.call_date).toLocaleDateString()}
                    </span>
                    <Badge tone={c.outcome === 'answered' ? 'success' : 'warning'}>
                      {c.outcome.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{c.notes || 'No notes'}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}