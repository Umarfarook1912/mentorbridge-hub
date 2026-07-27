import { useSyncExternalStore } from 'react'

function subscribe(query: string, callback: () => void) {
  const media = window.matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => subscribe(query, callback),
    () => window.matchMedia(query).matches,
    () => false
  )
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
