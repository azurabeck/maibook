import type { HeaderStructure, HeaderStructureDraft, HeaderStructureLayout } from '@/types'

export interface HeaderStructureManagerProps {
  projectId: string
}

export interface HeaderLayoutOption {
  id: HeaderStructureLayout
  title: string
  description: string
}

export interface HeaderStructureCardProps {
  structure: HeaderStructure
  onEdit: (structure: HeaderStructure) => void
  onDelete: (structure: HeaderStructure) => void
}

export interface HeaderStructureEditorProps {
  initialValue?: HeaderStructure | null
  onCancel: () => void
  onSave: (value: HeaderStructureDraft) => Promise<void>
}
