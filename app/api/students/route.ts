import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { z } from 'zod'

const studentSchema = z.object({
  fullName: z.string().min(1),
  guardianName: z.string().min(1),
  guardianPhone: z.string().min(1),
  roomId: z.number().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  religion: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  institution: z.string().optional(),
  course: z.string().optional(),
  yearOfStudy: z.string().optional(),
  studentNumber: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactAddress: z.string().optional(),
  bloodGroup: z.string().optional(),
  medicalConditions: z.string().optional(),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  healthNotes: z.string().optional(),
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
  const {
    fullName, guardianName, guardianPhone, roomId, dateOfBirth, gender, nationality, religion,
    phone, email, address, institution, course, yearOfStudy, studentNumber,
    emergencyContactName, emergencyContactRelation, emergencyContactPhone, emergencyContactAddress,
    bloodGroup, medicalConditions, allergies, medications, healthNotes,
  } = parsed.data
  const result = await pool.query(
    `INSERT INTO students (
       full_name, guardian_name, guardian_phone, room_id, date_of_birth, gender, nationality, religion,
       phone, email, address, institution, course, year_of_study, student_number,
       emergency_contact_name, emergency_contact_relation, emergency_contact_phone, emergency_contact_address,
       blood_group, medical_conditions, allergies, medications, health_notes
     ) VALUES (${Array.from({ length: 24 }, (_, index) => `$${index + 1}`).join(', ')}) RETURNING *`,
    [
      fullName, guardianName, guardianPhone, roomId || null, dateOfBirth || null, gender || null,
      nationality || null, religion || null, phone || null, email || null, address || null,
      institution || null, course || null, yearOfStudy || null, studentNumber || null,
      emergencyContactName || null, emergencyContactRelation || null, emergencyContactPhone || null,
      emergencyContactAddress || null, bloodGroup || null, medicalConditions || null, allergies || null,
      medications || null, healthNotes || null,
    ]
  )
  return NextResponse.json(result.rows[0], { status: 201 })
}