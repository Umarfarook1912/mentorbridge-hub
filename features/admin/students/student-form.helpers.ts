import type { StudentInput, UpdateStudentInput } from '@/lib/validations/student'
import type { IStudentUpdateMutation } from '@/services/students'

export function toStudentUpdatePayload(editData: UpdateStudentInput): IStudentUpdateMutation {
  return {
    fullName: editData.fullName,
    phone: editData.phone || '',
    studentCategory: editData.studentCategory || '',
    department: editData.department || '',
    domainInterest: editData.domainInterest || '',
    role: editData.role,
    sectionPermissions: editData.role === 'Executive' ? editData.sectionPermissions : [],
    isActive: editData.enrollmentStatus !== 'inactive',
    inactiveAt: editData.enrollmentStatus === 'inactive' ? editData.inactiveAt || null : null,
    companyName: editData.enrollmentStatus === 'company' ? editData.companyName?.trim() || null : null,
    companyRole: editData.enrollmentStatus === 'company' ? editData.companyRole?.trim() || null : null,
    companyLocation:
      editData.enrollmentStatus === 'company' ? editData.companyLocation?.trim() || null : null,
    companyJoinedAt:
      editData.enrollmentStatus === 'company' ? editData.companyJoinedAt || null : null,
  }
}

export type { StudentInput, UpdateStudentInput }
