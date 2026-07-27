import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Providers } from '@/components/providers'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'MentorBridge',
    template: '%s | MentorBridge',
  },
  description:
    'Attendance & Task Management platform for MentorBridge — bridging the gap between learning and industry.',
  keywords: ['mentorbridge', 'attendance', 'task management', 'mentorship', 'education'],
  authors: [{ name: 'MentorBridge' }],
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/logo.webp', type: 'image/webp' },
    ],
    apple: '/logo.webp',
  },
  openGraph: {
    title: 'MentorBridge',
    description: 'Attendance & Task Management',
    type: 'website',
    images: [{ url: '/logo.webp' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-background min-h-screen font-sans antialiased">
        <Providers>
          <TooltipProvider delay={300}>{children}</TooltipProvider>
        </Providers>
        <Toaster closeButton />
      </body>
    </html>
  )
}
