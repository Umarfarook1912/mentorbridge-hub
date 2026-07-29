'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { blogSchema, type BlogInput } from '@/lib/validations/blog'
import { useCreateBlog, useUpdateBlog, type IBlogEntity } from '@/services/blogs'
import { useAuthStore } from '@/store/auth-store'
import { getErrorMessage } from '@/utils/form'

interface BlogFormProps {
  blog?: IBlogEntity | null
  onSuccess: () => void
}

export function BlogForm({ blog, onSuccess }: BlogFormProps) {
  const isEdit = !!blog
  const { user } = useAuthStore()
  const { mutateAsync: createBlog, isPending: creating } = useCreateBlog()
  const { mutateAsync: updateBlog, isPending: updating } = useUpdateBlog()
  const isPending = creating || updating

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: { title: '', mediumUrl: '' },
  })

  useEffect(() => {
    reset({
      title: blog?.title ?? '',
      mediumUrl: blog?.medium_url ?? '',
    })
  }, [blog, reset])

  async function onSubmit(data: BlogInput) {
    if (!user) {
      toast.error('You must be signed in to share a blog')
      return
    }

    try {
      if (isEdit) {
        await updateBlog({
          id: blog.id,
          data: { title: data.title, mediumUrl: data.mediumUrl },
        })
        toast.success('Blog updated')
      } else {
        await createBlog({
          title: data.title,
          mediumUrl: data.mediumUrl,
          authorId: user.id,
          authorName: user.fullName,
        })
        toast.success('Blog shared successfully')
      }
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not save blog. Please try again.'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper label="Blog Title" htmlFor="title" error={errors.title} required>
        <Input id="title" placeholder="My journey into React" {...register('title')} />
      </FormFieldWrapper>

      <FormFieldWrapper
        label="Medium Blog URL"
        htmlFor="mediumUrl"
        error={errors.mediumUrl}
        required
        hint="Paste the full Medium article link"
      >
        <Input
          id="mediumUrl"
          type="url"
          placeholder="https://medium.com/@you/your-article"
          {...register('mediumUrl')}
        />
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? 'Save Changes' : 'Share Blog'}
      </Button>
    </form>
  )
}
