'use client'

import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { videoSchema, type VideoInput } from '@/lib/validations/video'
import { DOMAIN_INTERESTS } from '@/lib/constants'
import { useCreateVideo, useUpdateVideo, type IVideoEntity } from '@/services/videos'
import { getErrorMessage } from '@/utils/form'
import { useVideoPreview } from './use-video-preview'

interface VideoFormProps {
  video?: IVideoEntity | null
  onSuccess: () => void
}

export function VideoForm({ video, onSuccess }: VideoFormProps) {
  const isEdit = !!video
  const { mutateAsync: createVideo, isPending: creating } = useCreateVideo()
  const { mutateAsync: updateVideo, isPending: updating } = useUpdateVideo()
  const isPending = creating || updating

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<VideoInput>({
    resolver: zodResolver(videoSchema),
    defaultValues: {
      title: video?.title ?? '',
      youtubeUrl: video?.youtube_url ?? '',
      domain: (video?.domain as VideoInput['domain']) ?? 'General',
    },
  })

  const youtubeUrl = useWatch({ control, name: 'youtubeUrl' }) ?? ''
  const domain = useWatch({ control, name: 'domain' }) ?? 'General'
  const { preview, isLoading } = useVideoPreview(
    youtubeUrl,
    !isEdit || youtubeUrl !== video?.youtube_url
  )

  useEffect(() => {
    if (!preview) return
    if (!getValues('title').trim()) {
      setValue('title', preview.title, { shouldValidate: true })
    }
  }, [preview, getValues, setValue])

  async function onSubmit(data: VideoInput) {
    try {
      const payload = {
        title: data.title,
        youtubeUrl: data.youtubeUrl,
        domain: data.domain,
      }
      if (isEdit) {
        await updateVideo({ id: video.id, data: payload })
        toast.success('Video updated')
      } else {
        await createVideo(payload)
        toast.success('Video added')
      }
      onSuccess()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Could not save video'))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormFieldWrapper
        label="YouTube URL"
        htmlFor="youtubeUrl"
        error={errors.youtubeUrl}
        required
        hint="Paste a YouTube link to auto-fill title and thumbnail"
      >
        <Input
          id="youtubeUrl"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          {...register('youtubeUrl')}
        />
      </FormFieldWrapper>

      {isLoading ? <p className="text-muted-foreground text-xs">Fetching video details…</p> : null}

      <FormFieldWrapper label="Title" htmlFor="title" error={errors.title} required>
        <Input id="title" placeholder="React Interview — Cohort #3" {...register('title')} />
      </FormFieldWrapper>

      <FormFieldWrapper label="Domain" error={errors.domain} required>
        <Select
          value={domain}
          onValueChange={(value) =>
            setValue('domain', value as VideoInput['domain'], { shouldValidate: true })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select domain" />
          </SelectTrigger>
          <SelectContent>
            {DOMAIN_INTERESTS.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormFieldWrapper>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEdit ? 'Save Changes' : 'Add Video'}
      </Button>
    </form>
  )
}
