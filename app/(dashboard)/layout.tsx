import { Sidebar } from '@/components/shared/layout/sidebar'
import { Navbar } from '@/components/shared/layout/navbar'
import { MobileSidebar } from '@/components/shared/layout/mobile-sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <MobileSidebar />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
