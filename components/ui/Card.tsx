export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/95 border border-slate-200 rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      {action}
    </div>
  )
}