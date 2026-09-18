import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const callSchema = z.object({
  studentId: z.number(),
  calledBy: z.string().min(1),
  purpose: z.enum(['fee_reminder', 'general_update', 'complaint', 'emergency', 'other']),
  outcome: z.enum(['answered', 'no_answer', 'voicemail', 'switched_off']),
  notes: z.string().optional(),
  followUpNeeded: z.boolean().optional(),
  followUpDate: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  const query = studentId
    ? `SELECT c.*, s.full_name FROM call_logs c JOIN students s ON c.student_id = s.id WHERE c.student_id = $1 ORDER BY c.call_date DESC`
    : `SELECT c.*, s.full_name FROM call_logs c JOIN students s ON c.student_id = s.id ORDER BY c.call_date DESC`
  const result = studentId ? await pool.query(query, [studentId]) : await pool.query(query)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = callSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { studentId, calledBy, purpose, outcome, notes, followUpNeeded, followUpDate } = parsed.data
  const result = await pool.query(
    `INSERT INTO call_logs (student_id, called_by, purpose, outcome, notes, follow_up_needed, follow_up_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [studentId, calledBy, purpose, outcome, notes || null, followUpNeeded || false, followUpDate || null]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}