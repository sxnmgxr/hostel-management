import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  await pool.query('DELETE FROM expenses WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}