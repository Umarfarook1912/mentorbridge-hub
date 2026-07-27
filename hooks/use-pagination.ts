import { useState } from 'react'
import { PAGE_SIZE } from '@/lib/constants'

export function usePagination(total: number, pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize
  const canPrev = page > 1
  const canNext = page < totalPages

  function goTo(p: number) {
    setPage(Math.min(Math.max(1, p), totalPages))
  }

  function reset() {
    setPage(1)
  }

  return { page, pageSize, offset, totalPages, canPrev, canNext, goTo, reset }
}
