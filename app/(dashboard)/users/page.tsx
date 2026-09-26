'use client'

import { useEffect, useState } from 'react'
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'

const permissionOptions = [
  ['dashboard', 'Dashboard'],
  ['attendance', 'Attendance'],
  ['laundry', 'Laundry'],
  ['calls', 'Call logs'],
  ['calendar', 'Calendar'],
  ['communications', 'Communications'],
  ['students', 'Students'],
  ['rooms', 'Rooms'],
  ['fees', 'Fees'],
] as const

type User = {
  id: number
  email: string
  role: 'admin' | 'staff' | 'parent'
  student_id: number | null
  student_name?: string | null
  permissions: string[]
  active: boolean
}

type Student = { id: number; full_name: string }
type UserForm = {
  email: string
  password: string
  role: User['role']
  studentId: string
  permissions: string[]
  active: boolean
}

const emptyForm: UserForm = {
  email: '',
  password: '',
  role: 'staff',
  studentId: '',
  permissions: ['dashboard', 'attendance', 'laundry', 'calls'],
  active: true,
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [form, setForm] = useState<UserForm>(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadData() {
    setLoading(true)
    const [userData, studentData] = await Promise.all([apiGet('/api/users'), apiGet('/api/students')])
    setUsers(userData)
    setStudents(studentData)
    setLoading(false)
  }

  useEffect(() => { void Promise.resolve().then(loadData) }, [])

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
  }

  function editUser(user: User) {
    setEditingId(user.id)
    setForm({
      email: user.email,
      password: '',
      role: user.role,
      studentId: user.student_id ? String(user.student_id) : '',
      permissions: user.permissions || [],
      active: user.active,
    })
    setError('')
  }

  function togglePermission(permission: string) {
    setForm((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    if (form.role === 'parent' && !form.studentId) {
      setError('Parent accounts must be linked to a student.')
      return
    }
    if (!editingId && form.password.length < 8) {
      setError('New passwords must be at least 8 characters.')
      return
    }

    const body = {
      email: form.email,
      ...(form.password ? { password: form.password } : {}),
      role: form.role,
      studentId: form.studentId ? Number(form.studentId) : null,
      permissions: form.permissions,
      active: form.active,
    }

    try {
      if (editingId) await apiPut(`/api/users/${editingId}`, body)
      else await apiPost('/api/users', body)
      resetForm()
      await loadData()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save user.')
    }
  }

  async function removeUser(id: number) {
    if (!window.confirm('Delete this user account?')) return
    try {
      await apiDelete(`/api/users/${id}`)
      await loadData()
    } catch {
      setError('Unable to delete this user.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-700">Administration</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Users & access</h1>
        <p className="mt-2 text-sm text-slate-500">Create accounts and control exactly which areas staff can use.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader title={editingId ? 'Edit account' : 'Create account'} action={editingId ? <button className="text-xs font-medium text-blue-700" onClick={resetForm}>Cancel</button> : undefined} />
          <form onSubmit={submit} className="space-y-4 p-6">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Email</label>
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">{editingId ? 'New password (optional)' : 'Password'}</label>
              <input required={!editingId} type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Role</label>
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as User['role'] })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="parent">Parent</option>
              </select>
            </div>
            {form.role === 'parent' && (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Linked student</label>
                <select required value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">Select student</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.full_name}</option>)}
                </select>
              </div>
            )}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">Staff privileges</p>
              <div className="grid grid-cols-2 gap-2">
                {permissionOptions.map(([value, label]) => (
                  <label key={value} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={form.permissions.includes(value)} onChange={() => togglePermission(value)} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            {editingId && (
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={form.active} onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                Account active
              </label>
            )}
            {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <Button type="submit" className="w-full">{editingId ? 'Save changes' : 'Create account'}</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Accounts" />
          {loading ? <p className="p-6 text-sm text-slate-500">Loading accounts...</p> : (
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col gap-3 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{user.role === 'parent' ? `Parent of ${user.student_name || 'unlinked student'}` : user.role === 'staff' ? `${user.permissions.length} privileges enabled` : 'Full system access'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={user.active ? 'success' : 'danger'}>{user.active ? 'Active' : 'Inactive'}</Badge>
                    <Badge>{user.role}</Badge>
                    <Button variant="secondary" onClick={() => editUser(user)}>Edit</Button>
                    <Button variant="danger" onClick={() => removeUser(user.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
