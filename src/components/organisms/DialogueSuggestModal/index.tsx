import { MessagesSquare } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { AiReviewModal } from '@/components/organisms/AiReviewModal/index'

interface DialogueSuggestModalProps {
  content: string
  onApply: (newContent: string) => void
}

export function DialogueSuggestModal({ content, onApply }: DialogueSuggestModalProps) {
  return (
    <AiReviewModal
      content={content}
      onApply={onApply}
      triggerIcon={MessagesSquare}
      triggerLabel="Sugerir diálogo"
      triggerTitle="Sugerir melhorias apenas nas falas dos personagens"
      modalEyebrow="Revisão com IA"
      modalTitle="Sugerir diálogo"
      modalDescription="Melhorias de naturalidade e fluidez apenas nas falas dos personagens."
      noChangesMessage="Os diálogos deste capítulo já estão bons!"
      runAnalysis={(text) => aiProvider.suggestDialogueImprovements(text)}
    />
  )
}
