import type { StudentNoteCategory } from '@/lib/validations/student-note'

/** Selected / chip fill styles (brand tokens — not shadcn `secondary`, which is muted gray) */
export const NOTE_CATEGORY_STYLES: Record<StudentNoteCategory, string> = {
  General: 'bg-muted text-foreground border-foreground/20',
  Strength: 'bg-success/15 text-success border-success/40',
  Speaking: 'bg-brand-secondary/15 text-brand-secondary border-brand-secondary/40',
  Technical: 'bg-primary/15 text-primary border-primary/40',
  Communication: 'bg-warning/15 text-warning border-warning/40',
}

/** Left accent bar on note cards */
export const NOTE_CATEGORY_ACCENT: Record<StudentNoteCategory, string> = {
  General: 'border-l-muted-foreground/40',
  Strength: 'border-l-success',
  Speaking: 'border-l-brand-secondary',
  Technical: 'border-l-primary',
  Communication: 'border-l-warning',
}

/** Score bar fill inside the category sidebar */
export const NOTE_CATEGORY_BAR: Record<StudentNoteCategory, string> = {
  General: 'bg-foreground/40',
  Strength: 'bg-success',
  Speaking: 'bg-brand-secondary',
  Technical: 'bg-primary',
  Communication: 'bg-warning',
}
