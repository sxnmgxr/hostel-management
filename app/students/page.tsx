'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toast'
import { Phone } from 'lucide-react'

type Student = {
  id: number
  full_name: string
  guardian_name: string
  guardian_phone: string
  room_number: string | null
  active: boolean
}
type Room = { id: number; number: string }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [form, setForm] = useState({ fullName: '', guardianName: '', guardianPhone: '', roomId: '' })
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const { showToast } = useToast()

  async function loadData() {
    setLoading(true)
    const [studentsData, roomsData] = await Promise.all([apiGet('/api/students'), apiGet('/api/rooms')])
    setStudents(studentsData)
    setRooms(roomsData)
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    try {
      await apiPost('/api/students', {
        fullName: form.fullName,
        guardianName: form.guardianName,
        guardianPhone: form.guardianPhone,
        roomId: form.roomId ? Number(form.roomId) : undefined,
      })
      setForm({ fullName: '', guardianName: '', guardianPhone: '', roomId: '' })
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
      <h1 className="text-2xl font-semibold text-slate-900 mb-6">Students</h1>

      <Card className="mb-6">
        <CardHeader title="Add Student" />
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
            <input className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Name</label>
            <input className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Guardian Phone</label>
            <input className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Room</label>
            <select className="border border-slate-300 rounded-md px-3 py-2 text-sm w-full" value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}>
              <option value="">Unassigned</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>Room {r.number}</option>)}
            </select>
          </div>
          <Button type="submit" className="lg:col-span-4 w-fit">Add Student</Button>
        </form>
      </Card>

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