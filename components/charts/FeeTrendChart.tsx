'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type Point = { month: string; collected: number; pending: number }

export function FeeTrendChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          formatter={(value) => `Rs. ${Number(value ?? 0)}`}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="collected" name="Collected" fill="#1e40af" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}