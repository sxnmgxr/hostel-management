import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const student = await pool.query(
    `SELECT s.*, r.number AS room_number
     FROM students s
     LEFT JOIN rooms r ON s.room_id = r.id
     WHERE s.id = $1`,
    [id]
  )
  if (student.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const fees = await pool.query('SELECT * FROM fees WHERE student_id = $1', [id])
  const laundry = await pool.query('SELECT * FROM laundry WHERE student_id = $1', [id])
  const calls = await pool.query('SELECT * FROM call_logs WHERE student_id = $1 ORDER BY call_date DESC', [id])
  return NextResponse.json({
    ...student.rows[0],
    fees: fees.rows,
    laundryLogs: laundry.rows,
    calls: calls.rows,
  })
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json()
  const { fullName, guardianName, guardianPhone, roomId, active } = body
  const result = await pool.query(
    `UPDATE students
     SET full_name = COALESCE($1, full_name),
         guardian_name = COALESCE($2, guardian_name),
         guardian_phone = COALESCE($3, guardian_phone),
         room_id = COALESCE($4, room_id),
         active = COALESCE($5, active)
     WHERE id = $6 RETURNING *`,
    [fullName, guardianName, guardianPhone, roomId, active, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const result = await pool.query('DELETE FROM students WHERE id = $1', [id])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}