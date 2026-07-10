import type { GridStructure, GridStructureDraft } from '@/types'

export interface GridStructureManagerProps {
  projectId: string
}

export interface GridStructureEditorProps {
  initialValue?: GridStructure | null
  onCancel: () => void
  onSave: (draft: GridStructureDraft) => Promise<void>
}
