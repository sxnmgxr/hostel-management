import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const paymentSchema = z.object({
  paid: z.boolean(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'esewa', 'khalti', 'card']).default('cash'),
  paymentDate: z.string().optional(),
})

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const parsed = paymentSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const body = parsed.data
  const result = await pool.query(
    `UPDATE fees
     SET paid = $1,
         paid_date = $2,
         payment_date = $2,
         payment_method = $3,
         receipt_number = CASE WHEN $1 THEN COALESCE(receipt_number, 'REC-' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || '-' || id) ELSE receipt_number END
     WHERE id = $4 RETURNING *`,
    [body.paid, body.paid ? body.paymentDate || new Date() : null, body.paymentMethod, id]
  )
  if (result.rows.length === 0) return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}