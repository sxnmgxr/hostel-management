   import { NextResponse } from 'next/server'
   import { pool } from '@/lib/db'
   import { verifyPassword, signToken } from '@/lib/auth'

   export async function POST(req: Request) {
     const { email, password } = await req.json()

     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
     const user = result.rows[0]

     if (!user) {
       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
     }

     if (user.active === false) {
       return NextResponse.json({ error: 'This account is inactive' }, { status: 403 })
     }

     const valid = await verifyPassword(password, user.password)
     if (!valid) {
       return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
     }

     if (user.role === 'parent' && !user.student_id) {
       return NextResponse.json({ error: 'Parent account is not linked to a student' }, { status: 403 })
     }

     const token = await signToken({
       id: user.id,
       email: user.email,
       role: user.role,
       ...(user.student_id ? { studentId: user.student_id } : {}),
      permissions: user.permissions || [],
     })

     const response = NextResponse.json({
       id: user.id,
       email: user.email,
       role: user.role,
       ...(user.student_id ? { studentId: user.student_id } : {}),
      permissions: user.permissions || [],
     })
     response.cookies.set('token', token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax',
       path: '/',
       maxAge: 60 * 60 * 24 * 7,
     })
     return response
   }