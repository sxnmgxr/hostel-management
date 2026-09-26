import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const result = await pool.query(`
    SELECT s.id AS student_id, s.full_name, s.guardian_name, s.guardian_phone,
      s.emergency_contact_name, s.emergency_contact_relation, s.emergency_contact_phone,
      r.number AS room_number
    FROM students s
    LEFT JOIN rooms r ON r.id = s.room_id
    WHERE s.active = TRUE
    ORDER BY s.full_name
  `)
  return NextResponse.json(result.rows)
}
