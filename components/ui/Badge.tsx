type Tone = 'success' | 'danger' | 'warning' | 'neutral'

export function Badge({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: Tone }) {
  const tones = {
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    neutral: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  )
}