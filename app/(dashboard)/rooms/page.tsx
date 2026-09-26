'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiGet, apiPost, apiDelete } from '@/lib/api'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BedDouble, Building2, DoorOpen, Trash2, Users } from 'lucide-react'

type Room = {
  id: number
  number: string
  capacity: number
  room_type: string
  students: { id: number }[]
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [number, setNumber] = useState('')
  const [capacity, setCapacity] = useState('')
  const [roomType, setRoomType] = useState('Standard')
  const [loading, setLoading] = useState(true)

  const summary = useMemo(() => {
    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0)
    const totalOccupants = rooms.reduce((sum, room) => sum + (room.students?.length || 0), 0)
    const occupiedRooms = rooms.filter((room) => (room.students?.length || 0) > 0).length
    const availableRooms = rooms.length - occupiedRooms

    return { totalCapacity, totalOccupants, occupiedRooms, availableRooms }
  }, [rooms])

  async function loadRooms() {
    const data = await apiGet('/api/rooms')
    setRooms(data)
    setLoading(false)
  }

  useEffect(() => { void Promise.resolve().then(loadRooms) }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    await apiPost('/api/rooms', { number, capacity: Number(capacity), roomType })
    setNumber('')
    setCapacity('')
    setRoomType('Standard')
    loadRooms()
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this room?')) return
    await apiDelete(`/api/rooms/${id}`)
    loadRooms()
  }

  if (loading) return <p className="p-6 text-sm text-slate-500">Loading...</p>

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
          <BedDouble className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Accommodation</p>
          <h1 className="text-3xl font-bold text-slate-900">Rooms</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Total rooms</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">{rooms.length}</span>
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Occupancy</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">{summary.totalOccupants}</span>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Capacity</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-slate-900">{summary.totalCapacity}</span>
              <DoorOpen className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <p className="text-sm text-slate-500">Available rooms</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-700">{summary.availableRooms}</span>
              <BedDouble className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader title="Add Room" />
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Room number</label>
            <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" placeholder="A-101" value={number} onChange={(e) => setNumber(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Capacity</label>
            <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" placeholder="4" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Room type</label>
            <input className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-3 focus:ring-indigo-100" placeholder="Standard" value={roomType} onChange={(e) => setRoomType(e.target.value)} required />
          </div>
          <Button type="submit">Add Room</Button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Room Inventory" />

        {rooms.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No rooms added yet.</p>
        ) : (
          <div className="p-6">
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                  <tr>
                    <th className="text-left px-6 py-3 font-medium">Room</th>
                    <th className="text-left px-6 py-3 font-medium">Capacity</th>
                    <th className="text-left px-6 py-3 font-medium">Type</th>
                    <th className="text-left px-6 py-3 font-medium">Occupants</th>
                    <th className="text-left px-6 py-3 font-medium">Status</th>
                    <th className="text-right px-6 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rooms.map((room) => {
                    const occupants = room.students?.length || 0
                    const fillWidth = Math.min((occupants / room.capacity) * 100, 100)

                    return (
                      <tr key={room.id} className="align-middle">
                        <td className="px-6 py-4 font-semibold text-slate-900">{room.number}</td>
                        <td className="px-6 py-4 text-slate-600">{room.capacity}</td>
                        <td className="px-6 py-4 text-slate-600">{room.room_type}</td>
                        <td className="px-6 py-4 text-slate-600">{occupants}</td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <Badge tone={occupants >= room.capacity ? 'warning' : occupants > 0 ? 'success' : 'neutral'}>
                              {occupants >= room.capacity ? 'Full' : occupants > 0 ? 'Occupied' : 'Vacant'}
                            </Badge>
                            <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-200">
                              <div
                                className={`h-full rounded-full ${occupants >= room.capacity ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{ width: `${fillWidth}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(room.id)}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}