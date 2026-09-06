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
    isActive: editData.isActive,
    inactiveAt: editData.isActive ? null : editData.inactiveAt || null,
  }
}

export type { StudentInput, UpdateStudentInput }
