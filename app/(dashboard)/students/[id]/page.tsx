'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiGet } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm text-slate-800">{value || 'Not provided'}</dd>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader title={title} />
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 p-6">{children}</dl>
    </Card>
  )
}

type Fee = { id: number; month: string; amount: number; paid: boolean; due_date: string | null; payment_date: string | null; payment_method: string | null; receipt_number: string | null }
type LaundryLog = { id: number; date_sent: string; item_count: number; returned: boolean }
type CallLog = { id: number; call_date: string; outcome: string; notes: string | null }
type Student = {
  full_name: string
  guardian_name: string
  guardian_phone: string
  active: boolean
  admission_date: string
  room_number: string | null
  date_of_birth: string | null
  gender: string | null
  nationality: string | null
  religion: string | null
  phone: string | null
  email: string | null
  address: string | null
  institution: string | null
  course: string | null
  year_of_study: string | null
  student_number: string | null
  emergency_contact_name: string | null
  emergency_contact_relation: string | null
  emergency_contact_phone: string | null
  emergency_contact_address: string | null
  blood_group: string | null
  medical_conditions: string | null
  allergies: string | null
  medications: string | null
  health_notes: string | null
  fees: Fee[]
  laundryLogs: LaundryLog[]
  calls: CallLog[]
}

export default function StudentDetailPage() {
  const params = useParams()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiGet(`/api/students/${params.id}`).then((data) => {
      setStudent(data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) return <p className="text-sm text-slate-500">Loading...</p>
  if (!student) return <p className="text-sm text-slate-500">Student not found.</p>

  const healthNotes = [student.medical_conditions, student.allergies, student.medications, student.health_notes]
    .filter(Boolean).length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-slate-900">{student.full_name}</h1>
            <Badge tone={student.active ? 'success' : 'neutral'}>{student.active ? 'Active' : 'Inactive'}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {student.room_number ? `Room ${student.room_number}` : 'No room assigned'} · Registered {new Date(student.admission_date).toLocaleDateString()}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-blue-50 px-3 py-2"><div className="text-lg font-semibold text-blue-800">{student.fees.length}</div><div className="text-xs text-blue-700">Fees</div></div>
          <div className="rounded-lg bg-amber-50 px-3 py-2"><div className="text-lg font-semibold text-amber-800">{student.laundryLogs.length}</div><div className="text-xs text-amber-700">Laundry</div></div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2"><div className="text-lg font-semibold text-emerald-800">{student.calls.length}</div><div className="text-xs text-emerald-700">Calls</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
        <ProfileSection title="Personal Information">
          <Detail label="Full Name" value={student.full_name} />
          <Detail label="Date of Birth" value={student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : null} />
          <Detail label="Gender" value={student.gender} />
          <Detail label="Nationality" value={student.nationality} />
          <Detail label="Religion" value={student.religion} />
          <Detail label="Phone" value={student.phone} />
          <Detail label="Email" value={student.email} />
          <Detail label="Home Address" value={student.address} />
        </ProfileSection>

        <ProfileSection title="Academic Information">
          <Detail label="Institution / School" value={student.institution} />
          <Detail label="Course / Program" value={student.course} />
          <Detail label="Year of Study" value={student.year_of_study} />
          <Detail label="Student Number" value={student.student_number} />
          <Detail label="Guardian Name" value={student.guardian_name} />
          <Detail label="Guardian Phone" value={student.guardian_phone} />
        </ProfileSection>

        <ProfileSection title="Emergency Contact">
          <Detail label="Contact Name" value={student.emergency_contact_name} />
          <Detail label="Relationship" value={student.emergency_contact_relation} />
          <Detail label="Contact Phone" value={student.emergency_contact_phone} />
          <Detail label="Contact Address" value={student.emergency_contact_address} />
        </ProfileSection>

        <ProfileSection title="Health Information">
          <Detail label="Blood Group" value={student.blood_group} />
          <Detail label="Medical Conditions" value={student.medical_conditions} />
          <Detail label="Allergies" value={student.allergies} />
          <Detail label="Medications" value={student.medications} />
          <Detail label="Additional Notes" value={student.health_notes} />
          <Detail label="Health Records" value={healthNotes ? `${healthNotes} item${healthNotes === 1 ? '' : 's'} recorded` : null} />
        </ProfileSection>
      </div>

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
                  <th className="text-left px-6 py-3 font-medium">Payment date</th>
                  <th className="text-left px-6 py-3 font-medium">Method</th>
                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {student.fees.map((f) => (
                  <tr key={f.id}>
                    <td className="px-6 py-3">{f.month}</td>
                    <td className="px-6 py-3">Rs. {f.amount}</td>
                    <td className="px-6 py-3">{f.payment_date ? new Date(f.payment_date).toLocaleDateString() : 'Pending'}</td>
                    <td className="px-6 py-3 capitalize">{f.payment_method?.replace('_', ' ') || '—'}</td>
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
                {student.laundryLogs.map((l) => (
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
              {student.calls.map((c) => (
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