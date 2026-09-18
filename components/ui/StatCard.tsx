import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  tone = 'default',
  icon: Icon,
}: {
  label: string
  value: string | number
  tone?: 'default' | 'danger' | 'warning'
  icon?: LucideIcon
}) {
  const toneColor = {
    default: 'text-slate-900',
    danger: 'text-red-700',
    warning: 'text-amber-700',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon ? (
          <div className="p-2 rounded-md bg-slate-100 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        ) : null}
      </div>
      <p className={`text-3xl font-semibold mt-1 ${toneColor[tone]}`}>{value}</p>
    </div>
  )
}