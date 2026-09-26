import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json()
  const { number, capacity } = body
  const result = await pool.query(
    `UPDATE rooms SET number = COALESCE($1, number), capacity = COALESCE($2, capacity)
     WHERE id = $3 RETURNING *`,
    [number, capacity, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const result = await pool.query('DELETE FROM rooms WHERE id = $1', [id])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}