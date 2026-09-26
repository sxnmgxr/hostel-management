'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

type Point = { category: string; total: number }
const colors = ['#e11d48', '#f97316', '#f59e0b', '#0f766e', '#2563eb', '#7c3aed', '#64748b', '#94a3b8']

export function ExpenseCategoryChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="total" nameKey="category" innerRadius={52} outerRadius={78} paddingAngle={3}>
          {data.map((point, index) => <Cell key={point.category} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip formatter={(value) => `Rs. ${Number(value ?? 0).toLocaleString()}`} contentStyle={{ fontSize: 12, borderRadius: 12, border: '1px solid #e2e8f0' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}