   import bcrypt from 'bcryptjs'
   import { SignJWT, jwtVerify } from 'jose'

   const secret = new TextEncoder().encode(process.env.JWT_SECRET)

  export type UserRole = 'admin' | 'staff' | 'parent'

  export type SessionUser = {
    id: number
    email: string
    role: UserRole
    studentId?: number
    permissions?: string[]
  }

   export async function hashPassword(password: string) {
     return bcrypt.hash(password, 10)
   }

   export async function verifyPassword(password: string, hash: string) {
     return bcrypt.compare(password, hash)
   }

  export async function signToken(payload: SessionUser) {
     return new SignJWT(payload)
       .setProtectedHeader({ alg: 'HS256' })
       .setIssuedAt()
       .setExpirationTime('7d')
       .sign(secret)
   }

   export async function verifyToken(token: string) {
     try {
       const { payload } = await jwtVerify(token, secret)
      return payload as SessionUser
     } catch {
       return null
     }
   }
