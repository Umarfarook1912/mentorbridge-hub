'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  STUDENT_NOTE_CATEGORIES,
  studentNoteSchema,
  type StudentNoteInput,
} from '@/lib/validations/student-note'
import { NOTE_CATEGORY_STYLES } from './student-note.constants'
import { cn } from '@/utils/cn'

interface StudentNoteFormProps {
  initial?: StudentNoteInput
  submitLabel?: string
  isLoading?: boolean
  idPrefix?: string
  onSubmit: (data: StudentNoteInput) => Promise<void>
  onCancel?: () => void
  onRemoveScore?: () => void
}

export function StudentNoteForm({
  initial,
  submitLabel = 'Add note',
  isLoading,
  idPrefix = '',
  onSubmit,
  onCancel,
  onRemoveScore,
}: StudentNoteFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<StudentNoteInput>({
    resolver: zodResolver(studentNoteSchema),
    defaultValues: initial ?? { body: '', category: 'General', percentage: null },
  })

  const category = useWatch({ control, name: 'category' }) ?? 'General'
  const percentage = useWatch({ control, name: 'percentage' })

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data)
        if (!initial) reset({ body: '', category: 'General', percentage: null })
      })}
      className="space-y-3"
    >
      <div className="flex flex-wrap gap-1.5">
        {STUDENT_NOTE_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setValue('category', c, { shouldValidate: true })}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors',
              category === c
                ? NOTE_CATEGORY_STYLES[c]
                : 'bg-background text-muted-foreground hover:bg-muted border-border font-medium'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <Textarea
        id={`${idPrefix}note-body`}
        rows={3}
        placeholder="Write a note for this score…"
        className="focus-visible:border-foreground/30 focus-visible:ring-0 border-2 resize-none"
        {...register('body')}
      />
      {errors.body ? (
        <p className="text-destructive text-xs">{errors.body.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${idPrefix}note-percentage`}
              className="text-muted-foreground text-xs font-medium"
            >
              {category} %
            </label>
            <Input
              id={`${idPrefix}note-percentage`}
              type="number"
              inputMode="numeric"
              min={0}
              max={100}
              step={1}
              placeholder="0"
              aria-label={`Percent to add to ${category}`}
              className="h-8 w-20"
              value={percentage ?? ''}
              onChange={(event) => {
                const raw = event.target.value
                setValue('percentage', raw === '' ? null : Number(raw), { shouldValidate: true })
              }}
            />
          </div>
          <p className="text-muted-foreground text-xs">A score needs a note.</p>
          {errors.percentage ? (
            <p className="text-destructive text-xs">{errors.percentage.message}</p>
          ) : null}
        </div>

        <div className="flex justify-end gap-2">
          {onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          ) : null}
          {onRemoveScore ? (
            <Button type="button" variant="outline" onClick={onRemoveScore} disabled={isLoading}>
              Remove score
            </Button>
          ) : null}
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
