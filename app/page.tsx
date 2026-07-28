import { redirect } from 'next/navigation'

// Root redirects are handled by proxy.ts; this page is a fallback
export default function RootPage() {
  redirect('/login')
}
