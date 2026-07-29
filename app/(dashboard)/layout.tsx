import { Sidebar } from '@/components/shared/layout/sidebar'
import { Navbar } from '@/components/shared/layout/navbar'
import { MobileSidebar } from '@/components/shared/layout/mobile-sidebar'
import { DashboardScrollLock } from '@/components/shared/layout/dashboard-scroll-lock'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-dvh max-h-dvh overflow-hidden">
      <DashboardScrollLock />

      {/* Desktop sidebar */}
      <div className="hidden h-full md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Main content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
