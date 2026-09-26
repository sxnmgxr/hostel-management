import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const roomSchema = z.object({
  number: z.string().min(1),
  capacity: z.number().min(1),
  roomType: z.string().min(1).default('Standard'),
})

export async function GET() {
  const result = await pool.query(`
    SELECT r.*,
      COALESCE(json_agg(s) FILTER (WHERE s.id IS NOT NULL), '[]') AS students
    FROM rooms r
    LEFT JOIN students s ON s.room_id = r.id
    GROUP BY r.id
    ORDER BY r.number ASC
  `)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = roomSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { number, capacity, roomType } = parsed.data
  const result = await pool.query(
    'INSERT INTO rooms (number, capacity, room_type) VALUES ($1, $2, $3) RETURNING *',
    [number, capacity, roomType]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}