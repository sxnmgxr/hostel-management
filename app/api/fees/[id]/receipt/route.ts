import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { pool } from '@/lib/db'

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const result = await pool.query(`
    SELECT f.*, s.full_name, s.guardian_name, r.number AS room_number
    FROM fees f JOIN students s ON s.id = f.student_id
    LEFT JOIN rooms r ON r.id = s.room_id
    WHERE f.id = $1
  `, [id])
  const fee = result.rows[0]
  if (!fee) return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
  if (!fee.paid) return NextResponse.json({ error: 'Receipt is available after payment' }, { status: 400 })

  const document = await PDFDocument.create()
  const page = document.addPage([595.28, 841.89])
  const regularFont = await document.embedFont(StandardFonts.Helvetica)
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold)
  const dark = rgb(0.06, 0.09, 0.16)
  const muted = rgb(0.39, 0.45, 0.55)
  const draw = (text: string, x: number, y: number, size = 11, bold = false, color = dark) => {
    page.drawText(text, { x, y, size, font: bold ? boldFont : regularFont, color })
  }

  draw('Believers Hostel', 205, 770, 22, true)
  draw('Payment Receipt', 245, 748, 11, false, muted)
  draw(`Receipt number: ${fee.receipt_number || `REC-${fee.id}`}`, 56, 700)
  draw(`Payment date: ${new Date(fee.payment_date || fee.paid_date).toLocaleDateString()}`, 56, 680)
  draw(`Student: ${fee.full_name}`, 56, 640)
  draw(`Guardian: ${fee.guardian_name}`, 56, 620)
  draw(`Room: ${fee.room_number || 'Not assigned'}`, 56, 600)
  page.drawRectangle({ x: 56, y: 520, width: 483, height: 48, color: rgb(0.95, 0.96, 0.98) })
  draw(`Fee month: ${fee.month}`, 72, 540, 12, true)
  draw(`Amount paid: Rs. ${fee.amount}`, 360, 540, 12, true)
  draw(`Payment method: ${String(fee.payment_method || 'cash').replace('_', ' ')}`, 56, 480)
  draw('Thank you for your payment.', 220, 400, 10, false, muted)

  const pdfBytes = await document.save()
  const responseBuffer = new ArrayBuffer(pdfBytes.byteLength)
  new Uint8Array(responseBuffer).set(pdfBytes)

  return new NextResponse(responseBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="receipt-${fee.id}.pdf"`,
    },
  })
}