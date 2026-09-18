import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const studentSchema = z.object({
  fullName: z.string().min(1),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  roomId: z.number().optional(),
})

export async function GET() {
  const result = await pool.query(`
    SELECT s.*, r.number AS room_number
    FROM students s
    LEFT JOIN rooms r ON s.room_id = r.id
    ORDER BY s.created_at DESC
  `)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = studentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { fullName, guardianName, guardianPhone, roomId } = parsed.data
  const result = await pool.query(
    `INSERT INTO students (full_name, guardian_name, guardian_phone, room_id)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [fullName, guardianName, guardianPhone, roomId || null]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}