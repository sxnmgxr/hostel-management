import type { LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  detail,
  tone = 'default',
  icon: Icon,
  href,
}: {
  label: string
  value: string | number
  detail?: string
  tone?: 'default' | 'danger' | 'warning'
  icon?: LucideIcon
  href?: string
}) {
  const toneColor = {
    default: 'text-slate-900',
    danger: 'text-red-700',
    warning: 'text-amber-700',
  }

  const content = (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-slate-500">{label}</p>
        {Icon ? (
          <div className="p-2 rounded-md bg-slate-100 text-slate-600">
            <Icon className="w-4 h-4" />
          </div>
        ) : null}
      </div>
      <p className={`text-3xl font-semibold mt-1 ${toneColor[tone]}`}>{value}</p>
      {detail ? <p className="mt-2 text-xs text-slate-500">{detail}</p> : null}
    </div>
  )

  return href ? <a href={href} aria-label={`${label}: ${value}`}>{content}</a> : content
}