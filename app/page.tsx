import { redirect } from 'next/navigation'

// Root redirects are handled by middleware
// This page is a fallback
export default function RootPage() {
  redirect('/login')
}
