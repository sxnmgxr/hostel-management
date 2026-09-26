import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const generateSchema = z.object({ month: z.string().regex(/^\d{4}-\d{2}$/) })

export async function POST(req: NextRequest) {
  const parsed = generateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Month must use YYYY-MM format' }, { status: 400 })
  const [year, month] = parsed.data.month.split('-').map(Number)
  const result = await pool.query(
    `INSERT INTO fees (student_id, month, amount, due_date)
     SELECT s.id, $1, rule.monthly_amount,
       MAKE_DATE($2, $3, rule.due_day)
     FROM students s
     LEFT JOIN rooms r ON r.id = s.room_id
     CROSS JOIN LATERAL (
       SELECT fs.monthly_amount, fs.due_day
       FROM fee_structures fs
       WHERE fs.active = TRUE
         AND (fs.student_id = s.id OR (fs.student_id IS NULL AND fs.room_type = r.room_type) OR (fs.student_id IS NULL AND fs.room_type IS NULL))
       ORDER BY CASE WHEN fs.student_id = s.id THEN 1 WHEN fs.room_type = r.room_type THEN 2 ELSE 3 END
       LIMIT 1
     ) rule
     WHERE s.active = TRUE
       AND NOT EXISTS (SELECT 1 FROM fees existing WHERE existing.student_id = s.id AND existing.month = $1)
     RETURNING id`,
    [parsed.data.month, year, month]
  )
  return NextResponse.json({ created: result.rowCount || 0 })
}