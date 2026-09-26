'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useEffect } from 'react'
import {
  BarChart3,
  Bell,
  BedDouble,
  CalendarDays,
  CreditCard,
  MessageSquare,
  Receipt,
  FileText,
  GraduationCap,
  Home,
  Menu,
  Search,
  Settings,
  Shirt,
  UserCheck,
  Users,
  X,
} from 'lucide-react'

const links = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/students', label: 'Students', icon: Home },
  { href: '/rooms', label: 'Rooms', icon: BedDouble },
  { href: '/fees', label: 'Fees', icon: CreditCard },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/communications', label: 'Communications', icon: MessageSquare },
  { href: '/laundry', label: 'Laundry', icon: Shirt },
  { href: '/calls', label: 'Call Logs', icon: FileText },
  { href: '/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/attendance', label: 'Attendance', icon: UserCheck },
  { href: '/academic', label: 'Academic Records', icon: GraduationCap },
  { href: '/users', label: 'Users & Access', icon: Users, adminOnly: true },
]

const staffPermissions: Record<string, string> = {
  '/': 'dashboard',
  '/attendance': 'attendance',
  '/laundry': 'laundry',
  '/calls': 'calls',
  '/expenses': 'expenses',
  '/communications': 'communications',
  '/calendar': 'calendar',
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string>('admin')
  const [permissions, setPermissions] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then((response) => response.json())
      .then((data) => {
        setRole(data.user?.role || 'admin')
        setPermissions(data.user?.permissions || [])
      })
      .catch(() => setRole('admin'))
  }, [])

  const visibleLinks = links.filter((link) => {
    if ('adminOnly' in link && link.adminOnly && role !== 'admin') return false
    return role === 'staff' ? Boolean(staffPermissions[link.href] && permissions.includes(staffPermissions[link.href])) : role === 'parent' ? false : true
  })

  const navContent = (
    <>
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Believers Hostel</h1>
            <p className="text-xs text-slate-500">{role === 'staff' ? 'Staff Console' : 'Admin Console'}</p>
          </div>
        </div>

        <button
          type="button"
          aria-label="Close navigation"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="px-4 py-5">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Overview</div>
        <nav className="space-y-1.5">
          {visibleLinks.map((link) => {
            const Icon = link.icon
            const active = pathname === link.href

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-medium transition-all duration-200 ${
                  active
                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-200 p-4">
        <div className="space-y-2 text-sm text-slate-600">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100">
            <Search className="h-4 w-4" />
            Search
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100">
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-100">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        className="fixed left-4 top-4 z-40 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-lg shadow-slate-200 md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <button
          type="button"
          aria-label="Close mobile navigation overlay"
          className="fixed inset-0 z-30 bg-slate-900/35 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className="hidden w-[280px] min-h-screen border-r border-slate-200 bg-white/80 backdrop-blur-xl md:block">
        <div className="flex h-full flex-col">{navContent}</div>
      </aside>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] -translate-x-full border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-transform duration-200 md:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">{navContent}</div>
      </aside>
    </>
  )
}