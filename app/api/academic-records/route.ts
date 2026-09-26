import { NextRequest, NextResponse } from 'next/server'
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

export async function GET() {
  const result = await pool.query(`
    SELECT ar.*, s.full_name, s.student_number
    FROM academic_records ar
    JOIN students s ON s.id = ar.student_id
    ORDER BY ar.academic_year DESC, ar.term, ar.exam_name, s.full_name, ar.unit_name
  `)
  return NextResponse.json(result.rows)
}

export async function POST(req: NextRequest) {
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
    `INSERT INTO academic_records
      (student_id, academic_year, term, exam_name, exam_type, class_name, section, roll_number, result_format, working_days, present_days, absent_days, unit_code, unit_name,
       score, max_score, full_marks, pass_marks, theory_marks, practical_marks, grace_marks, component_marks,
       internal_marks, grade_point, th_grade, in_grade, final_grade, grade, credit_units, remarks)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)
     RETURNING *`,
    [studentId, academicYear, term, examName, examType, className || null, section || null, rollNumber || null, resultFormat, workingDays ?? null, presentDays ?? null, absentDays ?? null, unitCode || null, unitName,
      totalMarks, normalizedFullMarks, normalizedFullMarks, passMarks ?? 0, theoryMarks ?? score ?? null,
      practicalMarks ?? 0, graceMarks ?? 0, componentMarks ?? {}, internalMarks ?? 0, gradePoint ?? null, thGrade || null, inGrade || null, finalGrade || null, grade || null, creditUnits ?? null, remarks || null]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}