import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
  const result = await pool.query(`
    SELECT f.id, f.month, f.amount, f.due_date, s.full_name, s.guardian_name, s.guardian_phone
    FROM fees f JOIN students s ON s.id = f.student_id
    WHERE f.paid = FALSE
    ORDER BY f.due_date NULLS LAST, s.full_name
  `)
  return NextResponse.json(result.rows.map((fee) => ({
    ...fee,
    notice: `नमस्ते ${fee.guardian_name}, ${fee.full_name} को ${fee.month} महिनाको होस्टल शुल्क रु. ${fee.amount} बाँकी छ। कृपया ${fee.due_date ? new Date(fee.due_date).toLocaleDateString('ne-NP') : 'छिट्टै'} भित्र भुक्तानी गर्नुहोस्।`,
  })))
}

export async function POST(req: NextRequest) {
  const { feeIds } = await req.json().catch(() => ({ feeIds: [] }))
  const result = await pool.query(`
    SELECT f.id, f.month, f.amount, f.due_date, s.full_name, s.guardian_name, s.guardian_phone
    FROM fees f JOIN students s ON s.id = f.student_id
    WHERE f.paid = FALSE AND ($1::int[] IS NULL OR f.id = ANY($1::int[]))
    ORDER BY s.full_name
  `, [Array.isArray(feeIds) && feeIds.length ? feeIds : null])
  return NextResponse.json({ generated: result.rows.length, notices: result.rows.map((fee) => ({
    recipient: fee.guardian_phone,
    notice: `नमस्ते ${fee.guardian_name}, ${fee.full_name} को ${fee.month} महिनाको होस्टल शुल्क रु. ${fee.amount} बाँकी छ। कृपया शुल्क भुक्तानी गर्नुहोस्।`,
  })) })
}