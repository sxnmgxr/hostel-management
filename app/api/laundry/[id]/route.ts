import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const body = await req.json()
  const result = await pool.query(
    `UPDATE laundry SET returned = $1, return_date = $2 WHERE id = $3 RETURNING *`,
    [body.returned, body.returned ? new Date() : null, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Laundry record not found' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}