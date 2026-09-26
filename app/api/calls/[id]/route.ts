import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const result = await pool.query('DELETE FROM call_logs WHERE id = $1', [id])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Call record not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}