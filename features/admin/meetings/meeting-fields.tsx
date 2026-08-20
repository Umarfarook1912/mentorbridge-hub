'use client'

import {
  type Control,
  type FieldErrors,
  type FieldValues,
  type Path,
  type UseFormRegister,
  type UseFormSetValue,
  useWatch,
} from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormFieldWrapper } from '@/components/shared/forms/form-field-wrapper'
import { FilterPills } from '@/components/shared/forms/filter-pills'
import { MeetingAudiencePicker } from './meeting-audience-picker'
import type { MeetingInput } from '@/lib/validations/meeting'
import type { MeetingDomain } from '@/utils/meeting-audience'

interface MeetingFieldsProps<T extends FieldValues = FieldValues> {
  register: UseFormRegister<T>
  control: Control<T>
  setValue: UseFormSetValue<T>
  errors?: FieldErrors<MeetingInput>
  namePrefix?: string
  idPrefix?: string
}

export function MeetingFields<T extends FieldValues = FieldValues>({
  register,
  control,
  setValue,
  errors,
  namePrefix = '',
  idPrefix = '',
}: MeetingFieldsProps<T>) {
  const path = (field: string) =>
    (namePrefix ? `${namePrefix}${field}` : field) as Path<T>
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name)

  const targetDomains =
    (useWatch({ control, name: path('targetDomains') }) as MeetingDomain[] | undefined) ?? []
  const targetStudentIds =
    (useWatch({ control, name: path('targetStudentIds') }) as string[] | undefined) ?? []
  const attendanceMandatory =
    (useWatch({ control, name: path('attendanceMandatory') }) as boolean | undefined) ?? true

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      {/* Left: only this column scrolls when content is tall */}
      <div className="min-w-0 space-y-4 lg:max-h-[min(70vh,640px)] lg:overflow-y-auto lg:pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormFieldWrapper
            label="Meeting Title"
            htmlFor={id('title')}
            error={errors?.title}
            required
          >
            <Input
              id={id('title')}
              placeholder="React Fundamentals Session"
              {...register(path('title'))}
            />
          </FormFieldWrapper>
          <FormFieldWrapper
            label="Handled By"
            htmlFor={id('handledBy')}
            error={errors?.handledBy}
            required
          >
            <Input
              id={id('handledBy')}
              placeholder="Senthil Kumar"
              {...register(path('handledBy'))}
            />
          </FormFieldWrapper>
        </div>

        <FormFieldWrapper
          label="Description"
          htmlFor={id('description')}
          error={errors?.description}
        >
          <Textarea
            id={id('description')}
            placeholder="What will be covered…"
            rows={3}
            {...register(path('description'))}
          />
        </FormFieldWrapper>

        <div className="bg-muted/30 space-y-3 rounded-lg border p-4">
          <p className="text-sm font-medium">Schedule</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormFieldWrapper
              label="Date"
              htmlFor={id('meetingDate')}
              error={errors?.meetingDate}
              required
            >
              <Input id={id('meetingDate')} type="date" {...register(path('meetingDate'))} />
            </FormFieldWrapper>
            <FormFieldWrapper
              label="Start Time"
              htmlFor={id('startTime')}
              error={errors?.startTime}
              required
            >
              <Input id={id('startTime')} type="time" {...register(path('startTime'))} />
            </FormFieldWrapper>
            <FormFieldWrapper
              label="End Time"
              htmlFor={id('endTime')}
              error={errors?.endTime}
              required
            >
              <Input id={id('endTime')} type="time" {...register(path('endTime'))} />
            </FormFieldWrapper>
          </div>
        </div>

        <FormFieldWrapper
          label="Attendance"
          error={errors?.attendanceMandatory}
          required
          hint="Mandatory meetings appear in Attendance for marking"
        >
          <FilterPills
            aria-label="Attendance requirement"
            value={attendanceMandatory ? 'mandatory' : 'optional'}
            onChange={(v) =>
              setValue(path('attendanceMandatory'), (v === 'mandatory') as never, {
                shouldValidate: true,
              })
            }
            options={[
              { value: 'mandatory', label: 'Mandatory' },
              { value: 'optional', label: 'Not mandatory' },
            ]}
          />
        </FormFieldWrapper>

        <FormFieldWrapper label="Google Meet URL" htmlFor={id('meetUrl')} error={errors?.meetUrl}>
          <Input
            id={id('meetUrl')}
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij"
            {...register(path('meetUrl'))}
          />
        </FormFieldWrapper>
      </div>

      {/* Right: fixed — no scroll */}
      <aside className="lg:self-start">
        <div className="bg-muted/30 rounded-lg border p-4">
          <MeetingAudiencePicker
            domains={targetDomains}
            studentIds={targetStudentIds}
            onDomainsChange={(domains) =>
              setValue(path('targetDomains'), domains as never, { shouldValidate: true })
            }
            onStudentIdsChange={(ids) =>
              setValue(path('targetStudentIds'), ids as never, { shouldValidate: true })
            }
            error={errors?.targetDomains ?? errors?.targetStudentIds}
          />
        </div>
      </aside>
    </div>
  )
}
