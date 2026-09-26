'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { apiDelete, apiGet, apiPost } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react'

type EventType = 'general' | 'maintenance' | 'meeting' | 'holiday' | 'deadline'
type CalendarItem = { id: string; title: string; date: string; type: EventType | 'fee' | 'laundry' | 'call' | 'leave'; description?: string; time?: string; custom?: boolean }
type EventForm = { title: string; description: string; eventDate: string; startTime: string; endTime: string; eventType: EventType }
type ApiRow = { id: number; title?: string; description?: string; event_date?: string; start_time?: string; event_type?: EventType; student_name?: string; studentName?: string; due_date?: string; month?: string; date_sent?: string; call_date?: string; follow_up_date?: string; updated_at?: string; full_name?: string; status?: string }

const eventTypes: { value: EventType | 'all' | 'fee' | 'laundry' | 'call' | 'leave'; label: string; color: string }[] = [
  { value: 'all', label: 'All items', color: 'bg-slate-400' },
  { value: 'general', label: 'General', color: 'bg-blue-500' },
  { value: 'meeting', label: 'Meeting', color: 'bg-violet-500' },
  { value: 'maintenance', label: 'Maintenance', color: 'bg-amber-500' },
  { value: 'holiday', label: 'Holiday', color: 'bg-emerald-500' },
  { value: 'deadline', label: 'Deadline', color: 'bg-rose-500' },
  { value: 'fee', label: 'Fees', color: 'bg-red-500' },
  { value: 'laundry', label: 'Laundry', color: 'bg-cyan-500' },
  { value: 'call', label: 'Calls', color: 'bg-slate-500' },
  { value: 'leave', label: 'Attendance', color: 'bg-orange-500' },
]

function toDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function emptyForm(): EventForm {
  return { title: '', description: '', eventDate: toDateInput(new Date()), startTime: '', endTime: '', eventType: 'general' }
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function CalendarPage() {
  const [month, setMonth] = useState(() => new Date())
  const [items, setItems] = useState<CalendarItem[]>([])
  const [filter, setFilter] = useState<CalendarItem['type'] | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState(toDateInput(new Date()))
  const [form, setForm] = useState<EventForm>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const canManage = role === 'admin'

  async function fetchCalendarItems() {
    const [events, fees, laundry, calls, attendance] = await Promise.all([apiGet('/api/calendar'), apiGet('/api/fees'), apiGet('/api/laundry'), apiGet('/api/calls'), apiGet('/api/attendance')]) as ApiRow[][]
    return [
      ...events.map((event) => ({ id: `event-${event.id}`, title: event.title || 'Untitled event', description: event.description, date: event.event_date || '', time: event.start_time?.slice(0, 5), type: event.event_type || 'general', custom: true })),
      ...fees.map((fee) => ({ id: `fee-${fee.id}`, title: `Fee due: ${fee.student_name || 'Student'}`, date: fee.due_date || `${fee.month}-01`, type: 'fee' as const })),
      ...laundry.map((item) => ({ id: `laundry-${item.id}`, title: `Laundry: ${item.student_name || 'Student'}`, date: (item.date_sent || '').slice(0, 10), type: 'laundry' as const })),
      ...calls.map((call) => ({ id: `call-${call.id}`, title: `Call: ${call.full_name || 'Student'}`, date: (call.follow_up_date || call.call_date || '').slice(0, 10), type: 'call' as const })),
      ...attendance.map((item) => ({ id: `leave-${item.id}`, title: `${item.full_name || 'Student'}: ${item.status || 'Attendance'}`, date: (item.updated_at || '').slice(0, 10), type: 'leave' as const })),
    ].filter((item) => item.date) as CalendarItem[]
  }

  async function loadCalendar() {
    setLoading(true)
    try {
      setItems(await fetchCalendarItems())
      setError('')
    } catch {
      setError('Calendar data could not be loaded. Run the calendar migration, then retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchCalendarItems().then(setItems).catch(() => setError('Calendar data could not be loaded. Run the calendar migration, then retry.')).finally(() => setLoading(false))
    void apiGet('/api/auth/me').then((data) => setRole(data.user?.role || null)).catch(() => setRole(null))
  }, [])

  async function addEvent(event: FormEvent) {
    event.preventDefault()
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      setError('End time must be after start time.')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/calendar', form)
      setForm(emptyForm())
      setShowForm(false)
      await loadCalendar()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'The calendar event could not be saved.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEvent(id: string) {
    try {
      await apiDelete(`/api/calendar?id=${id.replace('event-', '')}`)
      await loadCalendar()
    } catch {
      setError('This event could not be deleted.')
    }
  }

  const visibleItems = useMemo(() => items.filter((item) => filter === 'all' || item.type === filter), [items, filter])
  const monthDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, index) => { const day = new Date(start); day.setDate(start.getDate() + index); return day })
  }, [month])
  const selectedItems = visibleItems.filter((item) => item.date === selectedDate)
  const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  function changeMonth(offset: number) {
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + offset, 1)
    setMonth(nextMonth)
    setSelectedDate(toDateInput(nextMonth))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><CalendarDays className="h-5 w-5" /></div><div><p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-700">Planning</p><h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-900">Calendar</h1></div></div>
        {canManage ? <button onClick={() => { setForm({ ...emptyForm(), eventDate: selectedDate }); setShowForm(true) }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700"><Plus className="h-4 w-4" /> Add event</button> : <p className="text-sm text-slate-500">View-only calendar</p>}
      </div>

      {error ? <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><span>{error}</span><button onClick={() => void loadCalendar()} className="font-semibold underline">Retry</button></div> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2"><button aria-label="Previous month" onClick={() => changeMonth(-1)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"><ChevronLeft className="h-5 w-5" /></button><h2 className="min-w-40 text-center text-lg font-semibold text-slate-900">{monthLabel}</h2><button aria-label="Next month" onClick={() => changeMonth(1)} className="rounded-lg p-2 text-slate-500 hover:bg-white hover:text-slate-900"><ChevronRight className="h-5 w-5" /></button><button onClick={() => { const today = new Date(); setMonth(today); setSelectedDate(toDateInput(today)) }} className="ml-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Today</button></div><select value={filter} onChange={(event) => setFilter(event.target.value as CalendarItem['type'] | 'all')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><option value="all">All calendar items</option>{eventTypes.filter((type) => type.value !== 'all').map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div>
          <div className="grid grid-cols-7 border-b border-slate-200 bg-white">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">{day}</div>)}</div>
          <div className="grid grid-cols-7 gap-px bg-slate-200">{monthDays.map((day) => { const date = toDateInput(day); const dayItems = visibleItems.filter((item) => item.date === date); const inMonth = day.getMonth() === month.getMonth(); const isToday = date === toDateInput(new Date()); return <button key={date} onClick={() => setSelectedDate(date)} className={`min-h-28 bg-white p-2 text-left align-top transition hover:bg-blue-50 ${!inMonth ? 'text-slate-300' : 'text-slate-700'} ${selectedDate === date ? 'ring-2 ring-inset ring-blue-500' : ''}`}><span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${isToday ? 'bg-blue-600 text-white' : ''}`}>{day.getDate()}</span><div className="mt-1 space-y-1">{dayItems.slice(0, 3).map((item) => <div key={item.id} className="flex items-center gap-1 truncate text-[11px] font-medium"><span className={`h-1.5 w-1.5 shrink-0 rounded-full ${eventTypes.find((type) => type.value === item.type)?.color || 'bg-slate-400'}`} />{item.title}</div>)}{dayItems.length > 3 ? <p className="text-[10px] text-slate-400">+{dayItems.length - 3} more</p> : null}</div></button> })}</div>
        </Card>

        <Card className="h-fit overflow-hidden"><CardHeader title={selectedDate ? formatDate(selectedDate) : 'Selected day'} />{loading ? <p className="p-5 text-sm text-slate-500">Loading calendar...</p> : selectedItems.length === 0 ? <div className="p-5"><p className="text-sm text-slate-500">Nothing scheduled for this day.</p>{canManage ? <button onClick={() => { setForm({ ...emptyForm(), eventDate: selectedDate }); setShowForm(true) }} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-800"><Plus className="h-4 w-4" /> Schedule something</button> : null}</div> : <div className="divide-y divide-slate-100">{selectedItems.map((item) => <div key={item.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-slate-900">{item.title}</p><p className="mt-1 text-xs capitalize text-slate-500">{item.time ? `${item.time} · ` : ''}{item.type}</p>{item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}</div>{item.custom && canManage ? <button aria-label={`Delete ${item.title}`} onClick={() => setDeleteId(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button> : item.custom ? null : <Badge tone={item.type === 'fee' ? 'danger' : item.type === 'leave' ? 'warning' : 'neutral'}>{item.type}</Badge>}</div></div>)}</div>}</Card>
      </div>

      {showForm ? <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/30 p-4" role="dialog" aria-modal="true"><Card className="w-full max-w-lg"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Add calendar event</h2><button onClick={() => setShowForm(false)} aria-label="Close"><X className="h-5 w-5 text-slate-500" /></button></div><form onSubmit={addEvent} className="space-y-4 p-5"><div><label className="mb-1 block text-xs font-semibold text-slate-600">Title</label><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Residents meeting" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-slate-600">Date</label><input required type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div><label className="mb-1 block text-xs font-semibold text-slate-600">Type</label><select value={form.eventType} onChange={(event) => setForm({ ...form, eventType: event.target.value as EventType })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{eventTypes.filter((type) => !['all', 'fee', 'laundry', 'call', 'leave'].includes(type.value)).map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></div></div><div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-xs font-semibold text-slate-600">Start time <span className="font-normal text-slate-400">optional</span></label><input type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div><label className="mb-1 block text-xs font-semibold text-slate-600">End time <span className="font-normal text-slate-400">optional</span></label><input type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div></div><div><label className="mb-1 block text-xs font-semibold text-slate-600">Notes <span className="font-normal text-slate-400">optional</span></label><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="Add useful details..." className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save event'}</button></div></form></Card></div> : null}
      <ConfirmDialog open={Boolean(deleteId)} title="Delete calendar event?" message="This saved event will be permanently removed." onCancel={() => setDeleteId(null)} onConfirm={() => { if (deleteId) void deleteEvent(deleteId); setDeleteId(null) }} />
    </div>
  )
}
