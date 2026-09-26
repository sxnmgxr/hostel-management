import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await req.json()
  const result = await pool.query(
    `UPDATE fee_structures
     SET name = $1, room_type = $2, student_id = $3, monthly_amount = $4, due_day = $5, active = $6
     WHERE id = $7 RETURNING *`,
    [body.name, body.roomType || null, body.studentId || null, body.monthlyAmount, body.dueDay, body.active ?? true, id]
  )
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await pool.query('DELETE FROM fee_structures WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}
