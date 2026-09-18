import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const laundrySchema = z.object({
  studentId: z.number(),
  itemCount: z.number().min(1),
})

export async function GET(req: NextRequest) {
  const studentId = req.nextUrl.searchParams.get('studentId')
  const query = studentId
    ? `SELECT l.*, s.full_name FROM laundry l JOIN students s ON l.student_id = s.id WHERE l.student_id = $1 ORDER BY l.date_sent DESC`
    : `SELECT l.*, s.full_name FROM laundry l JOIN students s ON l.student_id = s.id ORDER BY l.date_sent DESC`
  const result = studentId ? await pool.query(query, [studentId]) : await pool.query(query)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = laundrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { studentId, itemCount } = parsed.data
  const result = await pool.query(
    `INSERT INTO laundry (student_id, item_count) VALUES ($1, $2) RETURNING *`,
    [studentId, itemCount]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}