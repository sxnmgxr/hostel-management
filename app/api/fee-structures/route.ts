import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const structureSchema = z.object({
  name: z.string().min(1),
  roomType: z.string().optional().or(z.literal('')),
  studentId: z.number().int().positive().nullable().optional(),
  monthlyAmount: z.number().positive(),
  dueDay: z.number().int().min(1).max(28),
})

export async function GET() {
  const result = await pool.query(`
    SELECT fs.*, s.full_name AS student_name
    FROM fee_structures fs
    LEFT JOIN students s ON s.id = fs.student_id
    ORDER BY fs.active DESC, fs.name
  `)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const parsed = structureSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const result = await pool.query(
    `INSERT INTO fee_structures (name, room_type, student_id, monthly_amount, due_day)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.name, data.roomType || null, data.studentId || null, data.monthlyAmount, data.dueDay]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}
