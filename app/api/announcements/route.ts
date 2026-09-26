import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const announcementSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  announcementType: z.enum(['general', 'fee_reminder', 'event', 'closure']).default('general'),
  audience: z.enum(['all', 'parents']).default('parents'),
})

export async function GET() {
  const session = await getSession()
  const values: number[] = []
  let filter = 'a.published = TRUE'
  if (session?.role === 'parent') {
    filter += ' AND (a.audience = \'all\' OR a.audience = \'parents\') AND EXISTS (SELECT 1 FROM communication_logs cl WHERE cl.announcement_id = a.id AND cl.student_id = $1)'
    values.push(session.studentId || 0)
  }
  const result = await pool.query(`
    SELECT a.*, COUNT(cl.id)::int AS recipients
    FROM announcements a
    LEFT JOIN communication_logs cl ON cl.announcement_id = a.id
    WHERE ${filter}
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `, values)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  const parsed = announcementSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const announcement = await pool.query(
    `INSERT INTO announcements (title, body, announcement_type, audience, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.title, data.body, data.announcementType, data.audience, session?.email || null]
  )
  const recipients = await pool.query(`
    SELECT id, full_name, guardian_name, guardian_phone
    FROM students
    WHERE active = TRUE
  `)
  for (const student of recipients.rows) {
    await pool.query(
      `INSERT INTO communication_logs (announcement_id, student_id, recipient_name, recipient_phone, channel, status)
       VALUES ($1, $2, $3, $4, 'notice', 'queued')`,
      [announcement.rows[0].id, student.id, student.guardian_name || student.full_name, student.guardian_phone]
    )
  }
  return NextResponse.json({ ...announcement.rows[0], recipients: recipients.rowCount || 0 }, { status: 201 })
}
