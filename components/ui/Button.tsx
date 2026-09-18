import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
}

export function Button({ variant = 'primary', className = '', ...props }: Props) {
  const base = 'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200/60',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400',
    danger: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}