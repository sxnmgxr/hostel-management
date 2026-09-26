import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'
import { hashPassword } from '@/lib/auth'
import { z } from 'zod'

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'staff', 'parent']),
  studentId: z.number().int().positive().nullable().optional(),
  permissions: z.array(z.string()).default([]),
})

async function requireAdmin() {
  const session = await getSession()
  return session?.role === 'admin' ? session : null
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const result = await pool.query(`
    SELECT u.id, u.email, u.role, u.student_id, u.permissions, u.active, s.full_name AS student_name
    FROM users u LEFT JOIN students s ON s.id = u.student_id
    ORDER BY u.email
  `)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const parsed = userSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  if (data.role === 'parent' && !data.studentId) {
    return NextResponse.json({ error: 'Parent accounts must be linked to a student' }, { status: 400 })
  }
  const result = await pool.query(
    `INSERT INTO users (email, password, role, student_id, permissions)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, role, student_id, permissions, active`,
    [data.email, await hashPassword(data.password), data.role, data.studentId || null, data.permissions]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}