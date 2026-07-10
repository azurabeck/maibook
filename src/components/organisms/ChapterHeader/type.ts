import type { ChapterHeader, HeaderStructureDraft } from '@/types'

export interface ChapterHeaderProps {
  projectId: string
  value: ChapterHeader | null
  onChange: (header: ChapterHeader | null) => void
}

export interface HeaderTemplatePreviewProps {
  structure: HeaderStructureDraft
  compact?: boolean
  editable?: boolean
  onTextChange?: (field: 'primaryText' | 'secondaryText', value: string) => void
}
