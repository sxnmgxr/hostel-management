import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const academicRecordSchema = z.object({
  studentId: z.number().int().positive(),
  academicYear: z.string().trim().min(1).max(30),
  term: z.string().trim().min(1).max(50),
  examName: z.string().trim().min(1).max(150),
  examType: z.string().trim().min(1).max(50),
  className: z.string().trim().max(50).optional(),
  section: z.string().trim().max(30).optional(),
  rollNumber: z.string().trim().max(30).optional(),
  resultFormat: z.enum(['early_years', 'higher_class']).default('early_years'),
  workingDays: z.number().int().min(0).optional(),
  presentDays: z.number().int().min(0).optional(),
  absentDays: z.number().int().min(0).optional(),
  unitCode: z.string().trim().max(50).optional(),
  unitName: z.string().trim().min(1).max(150),
  score: z.number().min(0).optional(),
  maxScore: z.number().positive(),
  fullMarks: z.number().positive().optional(),
  passMarks: z.number().min(0).optional(),
  theoryMarks: z.number().min(0).optional(),
  practicalMarks: z.number().min(0).optional(),
  graceMarks: z.number().min(0).optional(),
  componentMarks: z.record(z.string(), z.number().min(0)).optional(),
  internalMarks: z.number().min(0).optional(),
  gradePoint: z.number().min(0).max(4).optional(),
  thGrade: z.string().trim().max(20).optional(),
  inGrade: z.string().trim().max(20).optional(),
  finalGrade: z.string().trim().max(20).optional(),
  grade: z.string().trim().max(20).optional(),
  creditUnits: z.number().min(0).optional(),
  remarks: z.string().trim().max(2000).optional(),
}).superRefine((value, context) => {
  const fullMarks = value.fullMarks ?? value.maxScore
  const componentsTotal = Object.values(value.componentMarks ?? {}).reduce((sum, mark) => sum + mark, 0)
  const total = (value.theoryMarks ?? value.score ?? 0) + (value.internalMarks ?? 0) + (value.practicalMarks ?? 0) + (value.graceMarks ?? 0) + componentsTotal
  if (value.passMarks !== undefined && value.passMarks > fullMarks) {
    context.addIssue({ code: 'custom', path: ['passMarks'], message: 'Pass marks cannot exceed full marks' })
  }
  if (total > fullMarks) {
    context.addIssue({ code: 'custom', path: ['score'], message: 'Score cannot exceed maximum score' })
  }
})

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const parsed = academicRecordSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const {
    studentId, academicYear, term, examName, examType, className, section, rollNumber, resultFormat, workingDays, presentDays, absentDays, unitCode, unitName,
    score, maxScore, fullMarks, passMarks, theoryMarks, practicalMarks, graceMarks, componentMarks, internalMarks, gradePoint, thGrade, inGrade, finalGrade, grade, creditUnits, remarks,
  } = parsed.data
  const componentsTotal = Object.values(componentMarks ?? {}).reduce((sum, mark) => sum + mark, 0)
  const totalMarks = (theoryMarks ?? score ?? 0) + (internalMarks ?? 0) + (practicalMarks ?? 0) + (graceMarks ?? 0) + componentsTotal
  const normalizedFullMarks = fullMarks ?? maxScore
  const result = await pool.query(
    `UPDATE academic_records
     SET student_id = $1, academic_year = $2, term = $3, exam_name = $4,
         exam_type = $5, class_name = $6, section = $7, roll_number = $8, result_format = $9,
         working_days = $10, present_days = $11, absent_days = $12, unit_code = $13, unit_name = $14, score = $15,
         max_score = $16, full_marks = $17, pass_marks = $18, theory_marks = $19, practical_marks = $20,
         grace_marks = $21, component_marks = $22, internal_marks = $23, grade_point = $24, th_grade = $25, in_grade = $26, final_grade = $27, grade = $28, credit_units = $29, remarks = $30
       WHERE id = $31
     RETURNING *`,
    [studentId, academicYear, term, examName, examType, className || null, section || null, rollNumber || null, resultFormat, workingDays ?? null, presentDays ?? null, absentDays ?? null, unitCode || null, unitName,
      totalMarks, normalizedFullMarks, normalizedFullMarks, passMarks ?? 0, theoryMarks ?? score ?? null,
      practicalMarks ?? 0, graceMarks ?? 0, componentMarks ?? {}, internalMarks ?? 0, gradePoint ?? null, thGrade || null, inGrade || null, finalGrade || null, grade || null, creditUnits ?? null, remarks || null, Number(id)]
  )
  if (result.rowCount === 0) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  return NextResponse.json(result.rows[0])
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await pool.query('DELETE FROM academic_records WHERE id = $1 RETURNING id', [Number(id)])
  if (result.rowCount === 0) return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}