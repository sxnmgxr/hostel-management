'use client'

import { createContext, useCallback, useContext, useState } from 'react'

type Toast = { id: number; message: string; tone: 'success' | 'error' }
type ToastContextType = { showToast: (message: string, tone?: 'success' | 'error') => void }

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, tone: 'success' | 'error' = 'success') => {
    const id = Date.now()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-md shadow-lg text-sm font-medium text-white ${
              t.tone === 'success' ? 'bg-green-700' : 'bg-red-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}