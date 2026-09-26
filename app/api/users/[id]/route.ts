import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const updateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).optional().or(z.literal('')),
  role: z.enum(['admin', 'staff', 'parent']),
  studentId: z.number().int().positive().nullable().optional(),
  permissions: z.array(z.string()),
  active: z.boolean(),
})

async function isAdmin() {
  return (await getSession())?.role === 'admin'
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const id = Number((await context.params).id)
  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  if (data.role === 'parent' && !data.studentId) return NextResponse.json({ error: 'Parent accounts must be linked to a student' }, { status: 400 })
  if (id === session.id && (data.role !== 'admin' || !data.active)) return NextResponse.json({ error: 'You cannot disable or demote your own admin account' }, { status: 400 })

  const passwordSql = data.password ? ', password = $6' : ''
  const values: unknown[] = [data.email, data.role, data.studentId || null, data.permissions, data.active]
  if (data.password) values.push(await hashPassword(data.password))
  values.push(id)
  const result = await pool.query(
    `UPDATE users SET email = $1, role = $2, student_id = $3, permissions = $4, active = $5${passwordSql}
     WHERE id = $${data.password ? 7 : 6}
     RETURNING id, email, role, student_id, permissions, active`,
    values
  )
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const id = Number((await context.params).id)
  if (id === session?.id) return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 })
  await pool.query('DELETE FROM users WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}