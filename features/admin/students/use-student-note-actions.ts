'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  useDeleteStudentNote,
  useUpdateStudentNote,
  type IStudentNote,
} from '@/services/student-notes'
import { getErrorMessage } from '@/utils/form'
import type { StudentNoteInput } from '@/lib/validations/student-note'

export function useStudentNoteActions(studentId: string) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<IStudentNote | null>(null)
  const [scoreToRemove, setScoreToRemove] = useState<IStudentNote | null>(null)
  const { mutateAsync: updateNote, isPending: updating } = useUpdateStudentNote(studentId)
  const { mutateAsync: deleteNote, isPending: deleting } = useDeleteStudentNote(studentId)

  useEffect(() => {
    setEditingId(null)
    setNoteToDelete(null)
    setScoreToRemove(null)
  }, [studentId])

  function editNote(noteId: string) {
    setEditingId(noteId)
    window.setTimeout(() => {
      document.getElementById(`student-note-${noteId}`)?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      })
    }, 50)
  }

  async function handleUpdate(noteId: string, data: StudentNoteInput) {
    try {
      await updateNote({ noteId, data })
      toast.success('Note updated')
      setEditingId(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleDelete() {
    if (!noteToDelete) return
    try {
      await deleteNote(noteToDelete.id)
      toast.success('Note deleted')
      if (editingId === noteToDelete.id) setEditingId(null)
      setNoteToDelete(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  async function handleRemoveScore() {
    if (!scoreToRemove?.body) return
    try {
      await updateNote({
        noteId: scoreToRemove.id,
        data: {
          body: scoreToRemove.body,
          category: scoreToRemove.category,
          percentage: null,
        },
      })
      toast.success('Score removed')
      if (editingId === scoreToRemove.id) setEditingId(null)
      setScoreToRemove(null)
    } catch (error: unknown) {
      toast.error(getErrorMessage(error))
    }
  }

  return {
    editingId,
    setEditingId,
    noteToDelete,
    setNoteToDelete,
    scoreToRemove,
    setScoreToRemove,
    updating,
    deleting,
    editNote,
    handleUpdate,
    handleDelete,
    handleRemoveScore,
  }
}
