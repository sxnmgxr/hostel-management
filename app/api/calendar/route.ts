import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'

const eventSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  eventDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().or(z.literal('')),
  eventType: z.enum(['general', 'maintenance', 'meeting', 'holiday', 'deadline']).default('general'),
}).refine((event) => !event.startTime || !event.endTime || event.endTime > event.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
})

export async function GET() {
  const result = await pool.query('SELECT * FROM calendar_events ORDER BY event_date, start_time NULLS LAST, id')
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  const parsed = eventSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const result = await pool.query(
    `INSERT INTO calendar_events (title, description, event_date, start_time, end_time, event_type, created_by)
    VALUES ($1, NULLIF($2, ''), $3::date, $4::time, $5::time, $6, $7) RETURNING *`,
    [data.title, data.description || '', data.eventDate, data.startTime || null, data.endTime || null, data.eventType, session.email]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (session?.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  const id = Number(new URL(req.url).searchParams.get('id'))
  if (!Number.isInteger(id)) return NextResponse.json({ error: 'A valid event id is required' }, { status: 400 })
  await pool.query('DELETE FROM calendar_events WHERE id = $1', [id])
  return NextResponse.json({ success: true })
}
