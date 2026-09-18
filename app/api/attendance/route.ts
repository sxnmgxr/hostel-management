import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const attendanceSchema = z.object({
  studentId: z.number(),
  status: z.enum(['in_hostel', 'away_home', 'medical_leave', 'outstation']),
  notes: z.string().optional(),
})

export async function GET() {
  const result = await pool.query(`
    SELECT a.*, s.full_name
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    ORDER BY a.updated_at DESC
  `)

  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = attendanceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { studentId, status, notes } = parsed.data

  const result = await pool.query(
    `INSERT INTO attendance (student_id, status, notes, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (student_id)
     DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = NOW()
     RETURNING *`,
    [studentId, status, notes || null]
  )

  return NextResponse.json(result.rows[0], { status: 201 })
}
