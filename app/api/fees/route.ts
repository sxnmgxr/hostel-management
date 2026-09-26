import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const feeSchema = z.object({
  studentId: z.number(),
  month: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  const studentId = session?.role === 'parent'
    ? String(session.studentId)
    : req.nextUrl.searchParams.get('studentId')
  const query = studentId
    ? `SELECT f.*, s.full_name, r.number AS room_number FROM fees f JOIN students s ON f.student_id = s.id LEFT JOIN rooms r ON s.room_id = r.id WHERE f.student_id = $1 ORDER BY f.created_at DESC`
    : `SELECT f.*, s.full_name, r.number AS room_number FROM fees f JOIN students s ON f.student_id = s.id LEFT JOIN rooms r ON s.room_id = r.id ORDER BY f.created_at DESC`
  const result = studentId ? await pool.query(query, [studentId]) : await pool.query(query)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = feeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { studentId, month, amount } = parsed.data
  const result = await pool.query(
    `INSERT INTO fees (student_id, month, amount, due_date) VALUES ($1, $2, $3, $4) RETURNING *`,
    [studentId, month, amount, parsed.data.dueDate || null]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}