import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata = {
  title: 'Believers Hostel Management',
  description: 'Hostel administration system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-100 text-slate-900 antialiased">
        <ToastProvider>
          <div className="flex min-h-screen flex-col md:flex-row">
            <Sidebar />
            <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
              <div className="mx-auto w-full max-w-[1700px]">{children}</div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}