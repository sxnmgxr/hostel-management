   import { NextResponse } from 'next/server'
   import type { NextRequest } from 'next/server'
   import { verifyToken } from '@/lib/auth'

   export async function middleware(req: NextRequest) {
     const token = req.cookies.get('token')?.value
     const { pathname } = req.nextUrl

    if (pathname === '/login' || pathname.startsWith('/api/auth/')) return NextResponse.next()

     if (!token) {
       return NextResponse.redirect(new URL('/login', req.url))
     }

     const payload = await verifyToken(token)
     if (!payload) {
       return NextResponse.redirect(new URL('/login', req.url))
     }

     if (payload.role === 'parent') {
      const isParentApiRead = req.method === 'GET' && (pathname === '/api/fees' || pathname === '/api/attendance' || pathname === '/api/announcements')
       if (pathname.startsWith('/api/') && !isParentApiRead) {
         return NextResponse.json({ error: 'Parent access is read-only' }, { status: 403 })
       }
       if (!pathname.startsWith('/api/') && pathname !== '/parent') {
         return NextResponse.redirect(new URL('/parent', req.url))
       }
     }

     if (pathname === '/parent' && payload.role !== 'parent') {
       return NextResponse.redirect(new URL(payload.role === 'staff' ? '/attendance' : '/', req.url))
     }

     if ((pathname === '/users' || pathname.startsWith('/api/users')) && payload.role !== 'admin') {
       return pathname.startsWith('/api/')
         ? NextResponse.json({ error: 'Admin access required' }, { status: 403 })
         : NextResponse.redirect(new URL(payload.role === 'parent' ? '/parent' : '/attendance', req.url))
     }

     const permissionForPath = pathname.startsWith('/students') || pathname.startsWith('/api/students')
       ? 'students'
       : pathname.startsWith('/rooms') || pathname.startsWith('/api/rooms')
         ? 'rooms'
        : pathname.startsWith('/fees') || pathname.startsWith('/api/fees') || pathname.startsWith('/api/fee-structures')
           ? 'fees'
           : pathname.startsWith('/laundry') || pathname.startsWith('/api/laundry')
             ? 'laundry'
             : pathname.startsWith('/calls') || pathname.startsWith('/api/calls')
               ? 'calls'
                     : pathname.startsWith('/expenses') || pathname.startsWith('/api/expenses')
                       ? 'expenses'
                       : pathname.startsWith('/calendar') || pathname.startsWith('/api/calendar')
                         ? 'calendar'
                         : pathname.startsWith('/communications') || pathname.startsWith('/api/communications') || pathname.startsWith('/api/announcements') || pathname.startsWith('/api/contacts')
                         ? 'communications'
               : pathname.startsWith('/attendance') || pathname.startsWith('/api/attendance')
                 ? 'attendance'
                 : pathname === '/' || pathname.startsWith('/api/dashboard')
                   ? 'dashboard'
                   : null

     if (payload.role === 'staff' && permissionForPath && !payload.permissions?.includes(permissionForPath)) {
       return pathname.startsWith('/api/')
         ? NextResponse.json({ error: 'You do not have permission for this area' }, { status: 403 })
         : NextResponse.redirect(new URL('/', req.url))
     }

     return NextResponse.next()
   }

   export const config = {
      matcher: ['/((?!_next/static|_next/image|favicon.ico|login).*)'],
   }