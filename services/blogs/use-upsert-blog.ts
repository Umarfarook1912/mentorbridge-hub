import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateBlogs } from '@/lib/invalidate-queries'
import type { IBlogMutation } from './blogs.types'

async function parseError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => ({}))
  return typeof payload.message === 'string' ? payload.message : fallback
}

export function useCreateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: IBlogMutation) => {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          mediumUrl: data.mediumUrl,
          authorName: data.authorName,
        }),
      })

      if (!response.ok) {
        throw new Error(await parseError(response, 'Failed to share blog'))
      }
      return response.json()
    },
    onSuccess: async () => {
      await invalidateBlogs(queryClient)
    },
  })
}

export function useUpdateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: { title: string; mediumUrl: string }
    }) => {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title,
          mediumUrl: data.mediumUrl,
        }),
      })

      if (!response.ok) {
        throw new Error(await parseError(response, 'Failed to update blog'))
      }
      return response.json()
    },
    onSuccess: async () => {
      await invalidateBlogs(queryClient)
    },
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/blogs/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        throw new Error(await parseError(response, 'Failed to delete blog'))
      }
      return response.json()
    },
    onSuccess: async () => {
      await invalidateBlogs(queryClient)
    },
  })
}
