'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Room = { room: string; capacity: number; occupied: number }

const COLORS = ['#1e40af', '#e2e8f0']

export function OccupancyChart({ data }: { data: Room[] }) {
  const totalCapacity = data.reduce((sum, r) => sum + r.capacity, 0)
  const totalOccupied = data.reduce((sum, r) => sum + r.occupied, 0)
  const chartData = [
    { name: 'Occupied', value: totalOccupied },
    { name: 'Vacant', value: Math.max(totalCapacity - totalOccupied, 0) },
  ]

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={52} outerRadius={74} paddingAngle={2}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {totalOccupied} of {totalCapacity} beds occupied
      </p>
    </div>
  )
}