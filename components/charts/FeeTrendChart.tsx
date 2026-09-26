'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Point = { month: string; collected: number; pending: number }

export function FeeTrendChart({ data }: { data: Point[] }) {
  const chartData = data.map((point) => ({
    ...point,
    total: point.collected + point.pending,
    collectionRate: point.collected + point.pending > 0 ? Math.round((point.collected / (point.collected + point.pending)) * 100) : 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 18, left: 4, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#dbe5f1" strokeWidth={1} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
        <YAxis yAxisId="amount" tickCount={5} tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${Number(value) / 1000}k`} />
        <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(15,23,42,0.08)' }}
          formatter={(value, name) => name === 'Collection rate' ? `${value}%` : `Rs. ${Number(value ?? 0).toLocaleString()}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar yAxisId="amount" dataKey="collected" name="Collected" fill="#5eead4" radius={[5, 5, 0, 0]} barSize={18} />
        <Bar yAxisId="amount" dataKey="pending" name="Pending" fill="#fcd34d" radius={[5, 5, 0, 0]} barSize={18} />
        <Line
          yAxisId="amount"
          type="monotone"
          dataKey="total"
          name="Total fees"
          stroke="#0f172a"
          strokeWidth={2.5}
          dot={{ r: 4, fill: '#ffffff', stroke: '#0f172a', strokeWidth: 2 }}
          activeDot={{ r: 6, fill: '#0f172a', stroke: '#ffffff', strokeWidth: 3 }}
        />
        <Line
          yAxisId="rate"
          type="monotone"
          dataKey="collectionRate"
          name="Collection rate"
          stroke="#1d4ed8"
          strokeWidth={3}
          dot={{ r: 5, fill: '#ffffff', stroke: '#1d4ed8', strokeWidth: 2.5 }}
          activeDot={{ r: 7, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 3 }}
          connectNulls
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}