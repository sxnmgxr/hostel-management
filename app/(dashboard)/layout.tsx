import { Sidebar } from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-4 sm:px-6 lg:px-8 xl:px-10">
        <div className="mx-auto w-full max-w-[1700px]">{children}</div>
      </main>
    </div>
  )
}
