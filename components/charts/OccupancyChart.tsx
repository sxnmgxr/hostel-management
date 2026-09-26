'use client'

type Room = { room: string; capacity: number; occupied: number }

export function OccupancyChart({ data }: { data: Room[] }) {
  const totalCapacity = data.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = data.reduce((sum, r) => sum + r.occupied, 0)
  const availableBeds = Math.max(totalCapacity - totalOccupied, 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-center">
        <div><p className="text-lg font-semibold text-slate-900">{totalOccupied} / {totalCapacity}</p><p className="text-[11px] text-slate-500">Beds occupied</p></div>
        <div><p className="text-lg font-semibold text-blue-700">{occupancyRate}%</p><p className="text-[11px] text-slate-500">Occupancy</p></div>
        <div><p className="text-lg font-semibold text-emerald-700">{availableBeds}</p><p className="text-[11px] text-slate-500">Available beds</p></div>
      </div>
      <div className="max-h-[226px] space-y-4 overflow-y-auto pr-1">
        {data.map((room) => {
          const available = Math.max(room.capacity - room.occupied, 0)
          const percentage = room.capacity > 0 ? Math.min(Math.round((room.occupied / room.capacity) * 100), 100) : 0
          return (
            <div key={room.room}>
              <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-800">Room {room.room}</span>
                <span className="text-xs text-slate-500">{room.occupied} / {room.capacity} occupied</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`Room ${room.room} occupancy`} aria-valuemin={0} aria-valuemax={room.capacity} aria-valuenow={room.occupied}>
                <div className={`h-full rounded-full ${percentage >= 100 ? 'bg-amber-500' : 'bg-blue-600'}`} style={{ width: `${percentage}%` }} />
              </div>
              <p className="mt-1 text-xs text-slate-500">{available} {available === 1 ? 'bed' : 'beds'} available</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}