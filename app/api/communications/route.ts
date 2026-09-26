import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const result = await pool.query(`
    SELECT cl.*, a.title, a.announcement_type, s.full_name AS student_name
    FROM communication_logs cl
    LEFT JOIN announcements a ON a.id = cl.announcement_id
    LEFT JOIN students s ON s.id = cl.student_id
    ORDER BY cl.sent_at DESC
    LIMIT 200
  `)
  return NextResponse.json(result.rows)
}
