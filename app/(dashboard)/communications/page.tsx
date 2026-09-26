'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost } from '@/lib/api'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

const types = [
  ['general', 'General notice'],
  ['fee_reminder', 'Fee reminder'],
  ['event', 'Event'],
  ['closure', 'Closure'],
] as const

type Contact = { student_id: number; full_name: string; guardian_name: string; guardian_phone: string; emergency_contact_name: string | null; emergency_contact_relation: string | null; emergency_contact_phone: string | null; room_number: string | null }
type Announcement = { id: number; title: string; body: string; announcement_type: string; audience: string; created_by: string | null; created_at: string; recipients: number }
type CommunicationLog = { id: number; recipient_name: string; recipient_phone: string | null; channel: string; status: string; sent_at: string; title: string | null; student_name: string | null }

export default function CommunicationsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [logs, setLogs] = useState<CommunicationLog[]>([])
  const [form, setForm] = useState({ title: '', body: '', announcementType: 'general', audience: 'parents' })
  const { showToast } = useToast()

  async function loadData() {
    const [contactData, announcementData, logData] = await Promise.all([apiGet('/api/contacts'), apiGet('/api/announcements'), apiGet('/api/communications')])
    setContacts(contactData)
    setAnnouncements(announcementData)
    setLogs(logData)
  }

  useEffect(() => { void Promise.resolve().then(loadData) }, [])

  async function sendAnnouncement(event: React.FormEvent) {
    event.preventDefault()
    try {
      const result = await apiPost('/api/announcements', form)
      setForm({ title: '', body: '', announcementType: 'general', audience: 'parents' })
      showToast(`Notice queued for ${result.recipients} guardians`)
      loadData()
    } catch {
      showToast('Failed to create announcement', 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700">Communication</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">Parent communication</h1>
        <p className="mt-2 text-sm text-slate-500">Keep contacts organized and record every notice sent from the hostel.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader title="Broadcast notice" />
          <form onSubmit={sendAnnouncement} className="space-y-4 p-6">
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Notice type</label><select value={form.announcementType} onChange={(event) => setForm({ ...form, announcementType: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">{types.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Audience</label><select value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="parents">Parents / guardians</option><option value="all">All active students</option></select></div>
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Title</label><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Monthly fee reminder" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <div><label className="mb-1 block text-xs font-medium text-slate-500">Message</label><textarea required value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} placeholder="Write the notice here..." className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" /></div>
            <p className="rounded-lg bg-cyan-50 px-3 py-2 text-xs text-cyan-800">The notice will appear in linked parent portals and create a communication log for each active student.</p>
            <Button type="submit" className="w-full">Broadcast notice</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Guardian contact list" />
          <div className="max-h-[520px] overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3 text-left">Student</th><th className="px-6 py-3 text-left">Guardian</th><th className="px-6 py-3 text-left">Emergency contact</th><th className="px-6 py-3 text-left">Room</th></tr></thead><tbody className="divide-y divide-slate-100">{contacts.map((contact) => <tr key={contact.student_id}><td className="px-6 py-4 font-medium text-slate-900">{contact.full_name}</td><td className="px-6 py-4"><p className="text-slate-800">{contact.guardian_name}</p><p className="text-xs text-slate-500">{contact.guardian_phone}</p></td><td className="px-6 py-4"><p className="text-slate-800">{contact.emergency_contact_name || 'Not provided'}</p><p className="text-xs text-slate-500">{contact.emergency_contact_phone || ''}</p></td><td className="px-6 py-4 text-slate-600">{contact.room_number || 'Unassigned'}</td></tr>)}</tbody></table>{contacts.length === 0 && <p className="p-6 text-sm text-slate-500">No active student contacts found.</p>}</div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Announcements" />
        <div className="divide-y divide-slate-100">{announcements.map((announcement) => <div key={announcement.id} className="px-6 py-4"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><h3 className="font-semibold text-slate-900">{announcement.title}</h3><Badge>{types.find(([key]) => key === announcement.announcement_type)?.[1] || announcement.announcement_type}</Badge></div><span className="text-xs text-slate-500">{new Date(announcement.created_at).toLocaleString()} · {announcement.recipients} recipients</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{announcement.body}</p></div>)}{announcements.length === 0 && <p className="p-6 text-sm text-slate-500">No announcements yet.</p>}</div>
      </Card>

      <Card>
        <CardHeader title="Communication log" />
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-6 py-3 text-left">Recipient</th><th className="px-6 py-3 text-left">Notice</th><th className="px-6 py-3 text-left">Channel</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-left">Sent / queued</th></tr></thead><tbody className="divide-y divide-slate-100">{logs.map((log) => <tr key={log.id}><td className="px-6 py-4"><p className="font-medium text-slate-900">{log.recipient_name}</p><p className="text-xs text-slate-500">{log.recipient_phone || 'No phone number'}</p></td><td className="px-6 py-4 text-slate-700">{log.title || 'Announcement removed'}</td><td className="px-6 py-4 capitalize text-slate-600">{log.channel}</td><td className="px-6 py-4"><Badge tone={log.status === 'sent' ? 'success' : 'warning'}>{log.status}</Badge></td><td className="px-6 py-4 text-slate-500">{new Date(log.sent_at).toLocaleString()}</td></tr>)}</tbody></table>{logs.length === 0 && <p className="p-6 text-sm text-slate-500">No communication history yet.</p>}</div>
      </Card>
    </div>
  )
}
