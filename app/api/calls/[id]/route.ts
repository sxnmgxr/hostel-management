import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  await pool.query('DELETE FROM call_logs WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}