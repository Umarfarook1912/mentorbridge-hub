'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Camera } from 'lucide-react'
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
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateProfile } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { DEPARTMENTS, DOMAIN_INTERESTS } from '@/lib/constants'
import { profileSchema, type ProfileInput } from './profile-form.schema'

export function ProfileForm() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const userId = user?.id

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '', department: '', domainInterest: '' },
  })

  useEffect(() => {
    if (!userId) return
    const id = userId
    let mounted = true

    async function loadProfile() {
      setLoadingProfile(true)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, phone, department, domain_interest, avatar_url, email, role')
        .eq('id', id)
        .single()

      if (!mounted) return
      if (error || !profile) {
        toast.error(error?.message ?? 'Failed to load profile')
        setLoadingProfile(false)
        return
      }

      reset({
        fullName: profile.full_name ?? '',
        phone: profile.phone ?? '',
        department: profile.department ?? '',
        domainInterest: profile.domain_interest ?? '',
      })

      setUser({
        id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        avatarUrl: profile.avatar_url,
        phone: profile.phone ?? null,
        department: profile.department,
        domainInterest: profile.domain_interest ?? null,
      })
      setLoadingProfile(false)
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [userId, reset, setUser, supabase])

  const department = watch('department')
  const domainInterest = watch('domainInterest')

  async function onSubmit(data: ProfileInput) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone || null,
        department: data.department,
        domain_interest: data.domainInterest,
      })
      .eq('id', user.id)

    if (error) {
      toast.error(error.message)
      return
    }

    setUser({
      ...user,
      fullName: data.fullName,
      phone: data.phone || null,
      department: data.department,
      domainInterest: data.domainInterest,
    })
    reset(data)
    await invalidateProfile(queryClient)
    toast.success('Profile updated')
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })
    if (uploadError) {
      toast.error(uploadError.message)
      setUploading(false)
      return
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
    setUser({ ...user, avatarUrl: publicUrl })
    await invalidateProfile(queryClient)
    toast.success('Avatar updated')
    setUploading(false)
  }

  if (!user) return null

  return (
    <div className="max-w-lg space-y-6">
      <FeatureCardSection title="Profile Photo">
        <div className="flex items-center gap-4">
          <div className="relative">
            <UserAvatar name={user.fullName} avatarUrl={user.avatarUrl} size="lg" />
            <label className="bg-primary text-primary-foreground hover:bg-primary/90 absolute -right-1 -bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full shadow-sm">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="h-3.5 w-3.5" />
              )}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <p className="font-medium">{user.fullName}</p>
            <p className="text-muted-foreground text-sm">{user.role}</p>
          </div>
        </div>
      </FeatureCardSection>

      <FeatureCardSection title="Personal Information">
        {loadingProfile ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-5 w-5 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" autoComplete="off">
            <FormFieldWrapper label="Full Name" htmlFor="fullName" error={errors.fullName} required>
              <Input id="fullName" autoComplete="name" {...register('fullName')} />
            </FormFieldWrapper>
            <FormFieldWrapper label="Email">
              <Input value={user.email} disabled readOnly />
            </FormFieldWrapper>
            <FormFieldWrapper label="Phone Number" htmlFor="phone" error={errors.phone}>
              <Input
                id="phone"
                type="tel"
                autoComplete="off"
                placeholder="+91 9876543210"
                {...register('phone')}
              />
            </FormFieldWrapper>
            <FormFieldWrapper label="Department" error={errors.department} required>
              <Select
                value={department || null}
                onValueChange={(v) => setValue('department', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
            <FormFieldWrapper label="Domain Interest" error={errors.domainInterest} required>
              <Select
                value={domainInterest || null}
                onValueChange={(v) => setValue('domainInterest', v ?? '', { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select domain interest" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAIN_INTERESTS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormFieldWrapper>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        )}
      </FeatureCardSection>
    </div>
  )
}
