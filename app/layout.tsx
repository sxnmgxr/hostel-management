import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = {
  title: 'Believers Hostel Management',
  description: 'Hostel administration system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  )
}
