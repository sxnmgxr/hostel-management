'use client'

import { FormEvent, useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'

type Student = {
  id: number
  full_name: string
  guardian_name: string
  guardian_phone: string
  room_number: string | null
  active: boolean
}
type Room = { id: number; number: string }

const emptyForm = {
  fullName: '', guardianName: '', guardianPhone: '', roomId: '', dateOfBirth: '', gender: '',
  nationality: '', religion: '', phone: '', email: '', address: '', institution: '', course: '',
  yearOfStudy: '', studentNumber: '', emergencyContactName: '', emergencyContactRelation: '',
  emergencyContactPhone: '', emergencyContactAddress: '', bloodGroup: '', medicalConditions: '',
  allergies: '', medications: '', healthNotes: '',
}

function Field({ label, name, form, setForm, type = 'text', required = false, wide = false }: {
  label: string
  name: keyof typeof emptyForm
  form: typeof emptyForm
  setForm: React.Dispatch<React.SetStateAction<typeof emptyForm>>
  type?: string
  required?: boolean
  wide?: boolean
}) {
  return (
    <label className={wide ? 'sm:col-span-2' : ''}>
      <span className="block text-xs font-medium text-slate-500 mb-1">{label}{required ? ' *' : ''}</span>
      {wide ? (
        <textarea name={name} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={required} rows={3} className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full resize-y" />
      ) : (
        <input name={name} type={type} value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} required={required} className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" />
      )}
    </label>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="sm:col-span-2 border-b border-slate-100 pb-2 text-sm font-semibold uppercase tracking-wide text-blue-800">{children}</h3>
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    const [studentsData, roomsData] = await Promise.all([apiGet('/api/students'), apiGet('/api/rooms')])
    setStudents(studentsData)
    setRooms(roomsData)
    setLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const [studentsData, roomsData] = await Promise.all([apiGet('/api/students'), apiGet('/api/rooms')])
      setStudents(studentsData)
      setRooms(roomsData)
      setLoading(false)
    }
    void load()
  }, [])

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/students', {
        ...form,
        roomId: form.roomId ? Number(form.roomId) : undefined,
      })
      setForm(emptyForm)
      setShowForm(false)
      showToast('Student added successfully')
      loadData()
    } catch {
      showToast('Failed to add student', 'error')
    }
  }

  async function confirmDelete() {
    if (deleteId == null) return
    try {
      await apiDelete(`/api/students/${deleteId}`)
      showToast('Student removed')
      loadData()
    } catch {
      showToast('Failed to remove student', 'error')
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Students</h1>
        <Button type="button" onClick={() => setShowForm(true)}>Add Student</Button>
      </div>

      {showForm && <Card className="mb-6">
        <CardHeader
          title="Register Student"
          action={<Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Close</Button>}
        />
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <SectionTitle>Personal Information</SectionTitle>
          <Field label="Full Name" name="fullName" form={form} setForm={setForm} required />
          <Field label="Date of Birth" name="dateOfBirth" form={form} setForm={setForm} type="date" />
          <Field label="Gender" name="gender" form={form} setForm={setForm} />
          <Field label="Nationality" name="nationality" form={form} setForm={setForm} />
          <Field label="Religion" name="religion" form={form} setForm={setForm} />
          <Field label="Student Phone" name="phone" form={form} setForm={setForm} type="tel" />
          <Field label="Email" name="email" form={form} setForm={setForm} type="email" />
          <Field label="Home Address" name="address" form={form} setForm={setForm} wide />

          <SectionTitle>Hostel & Guardian</SectionTitle>
          <Field label="Guardian Name" name="guardianName" form={form} setForm={setForm} required />
          <Field label="Guardian Phone" name="guardianPhone" form={form} setForm={setForm} type="tel" required />
          <label>
            <span className="block text-xs font-medium text-slate-500 mb-1">Room</span>
            <select className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              <option value="">Unassigned</option>
              {rooms.map((room) => <option key={room.id} value={room.id}>Room {room.number}</option>)}
            </select>
          </label>

          <SectionTitle>Academic Information</SectionTitle>
          <Field label="Institution / School" name="institution" form={form} setForm={setForm} />
          <Field label="Course / Program" name="course" form={form} setForm={setForm} />
          <Field label="Year of Study" name="yearOfStudy" form={form} setForm={setForm} />
          <Field label="Student Number" name="studentNumber" form={form} setForm={setForm} />

          <SectionTitle>Emergency Contact</SectionTitle>
          <Field label="Contact Name" name="emergencyContactName" form={form} setForm={setForm} />
          <Field label="Relationship" name="emergencyContactRelation" form={form} setForm={setForm} />
          <Field label="Contact Phone" name="emergencyContactPhone" form={form} setForm={setForm} type="tel" />
          <Field label="Contact Address" name="emergencyContactAddress" form={form} setForm={setForm} wide />

          <SectionTitle>Health Information</SectionTitle>
          <Field label="Blood Group" name="bloodGroup" form={form} setForm={setForm} />
          <Field label="Medical Conditions" name="medicalConditions" form={form} setForm={setForm} />
          <Field label="Allergies" name="allergies" form={form} setForm={setForm} />
          <Field label="Current Medications" name="medications" form={form} setForm={setForm} />
          <Field label="Additional Health Notes" name="healthNotes" form={form} setForm={setForm} wide />

          <Button type="submit" className="sm:col-span-2 w-fit">Register Student</Button>
        </form>
      </Card>}

      <Card>
        <CardHeader title="All Students" />
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No students added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="text-left px-6 py-3 font-medium">Name</th>
                <th className="text-left px-6 py-3 font-medium">Guardian</th>
                <th className="text-left px-6 py-3 font-medium">Phone</th>
                <th className="text-left px-6 py-3 font-medium">Room</th>
                <th className="text-left px-6 py-3 font-medium">Status</th>
                <th className="text-right px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-3 font-medium text-slate-900">
                    <a href={`/students/${s.id}`} className="hover:text-blue-800 hover:underline">{s.full_name}</a>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{s.guardian_name}</td>
                  <td className="px-6 py-3 text-slate-600">{s.guardian_phone}</td>
                  <td className="px-6 py-3 text-slate-600">{s.room_number || '—'}</td>
                  <td className="px-6 py-3"><Badge tone={s.active ? 'success' : 'neutral'}>{s.active ? 'Active' : 'Inactive'}</Badge></td>
                  <td className="px-6 py-3 text-right">
                    <Button variant="danger" onClick={() => setDeleteId(s.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <ConfirmDialog
        open={deleteId !== null}
        title="Remove Student"
        message="This will permanently remove the student and their fee/laundry history."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  )
}