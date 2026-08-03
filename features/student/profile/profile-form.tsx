'use client'

import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Loader2, Camera } from 'lucide-react'
import { toast } from 'sonner'
import { UserAvatar } from '@/components/shared/data-display/user-avatar'
import { FeatureCardSection } from '@/components/shared/data-display/feature-card'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { invalidateProfile } from '@/lib/invalidate-queries'
import { useAuthStore } from '@/store/auth-store'
import { profileSchema, type ProfileInput } from './profile-form.schema'
import { ProfileInfoFields } from './profile-info-fields'

export function ProfileForm() {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [uploading, setUploading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const supabase = getSupabaseBrowserClient()
  const userId = user?.id

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      studentCategory: 'SSM Student',
      department: '',
      domainInterest: '',
    },
  })

  const studentCategory = useWatch({ control, name: 'studentCategory' })
  const department = useWatch({ control, name: 'department' })
  const domainInterest = useWatch({ control, name: 'domainInterest' })

  useEffect(() => {
    if (!userId) return
    const id = userId
    let mounted = true

    async function loadProfile() {
      setLoadingProfile(true)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(
          'full_name, phone, department, domain_interest, student_category, avatar_url, email, role, section_permissions'
        )
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
        studentCategory:
          (profile.student_category as ProfileInput['studentCategory']) ?? 'SSM Student',
        department: profile.department ?? '',
        domainInterest: profile.domain_interest ?? '',
      })

      setUser({
        id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        sectionPermissions: profile.section_permissions ?? null,
        avatarUrl: profile.avatar_url,
        phone: profile.phone ?? null,
        department: profile.department,
        domainInterest: profile.domain_interest ?? null,
        studentCategory: profile.student_category ?? null,
      })
      setLoadingProfile(false)
    }

    loadProfile()
    return () => {
      mounted = false
    }
  }, [userId, reset, setUser, supabase])

  async function onSubmit(data: ProfileInput) {
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone || null,
        student_category: data.studentCategory,
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
      studentCategory: data.studentCategory,
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
          <ProfileInfoFields
            email={user.email}
            register={register}
            setValue={setValue}
            errors={errors}
            studentCategory={studentCategory}
            department={department}
            domainInterest={domainInterest}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}
      </FeatureCardSection>
    </div>
  )
}
