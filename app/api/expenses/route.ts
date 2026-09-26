import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const expenseSchema = z.object({
  category: z.enum(['electricity', 'food', 'staff_salary', 'maintenance', 'water', 'internet', 'supplies', 'other']),
  title: z.string().min(1),
  amount: z.number().positive(),
  expenseDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'esewa', 'khalti', 'card']).default('cash'),
  vendor: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month')
  const values: string[] = []
  const filter = month ? 'WHERE TO_CHAR(expense_date, \'YYYY-MM\') = $1' : ''
  if (month) values.push(month)
  const [expenses, summary, categories] = await Promise.all([
    pool.query(`SELECT * FROM expenses ${filter} ORDER BY expense_date DESC, created_at DESC`, values),
    pool.query(`SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM expenses ${filter}`, values),
    pool.query(`SELECT category, COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM expenses ${filter} GROUP BY category ORDER BY total DESC`, values),
  ])
  return NextResponse.json({ expenses: expenses.rows, summary: summary.rows[0], categories: categories.rows })
}

export async function POST(req: NextRequest) {
  const parsed = expenseSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  const data = parsed.data
  const result = await pool.query(
    `INSERT INTO expenses (category, title, amount, expense_date, payment_method, vendor, reference, notes)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), $5, $6, $7, $8) RETURNING *`,
    [data.category, data.title, data.amount, data.expenseDate || null, data.paymentMethod, data.vendor || null, data.reference || null, data.notes || null]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}