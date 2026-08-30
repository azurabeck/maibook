import { SpellCheck } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { AiReviewModal } from '@/components/organisms/AiReviewModal/index'

interface GrammarCheckModalProps {
  content: string
  onApply: (newContent: string) => void
}

export function GrammarCheckModal({ content, onApply }: GrammarCheckModalProps) {
  return (
    <AiReviewModal
      content={content}
      onApply={onApply}
      triggerIcon={SpellCheck}
      triggerLabel="Verificar gramática"
      triggerTitle="Verificar gramática, pontuação, coerência e ritmo"
      modalEyebrow="Revisão com IA"
      modalTitle="Verificar gramática"
      modalDescription="Gramática, pontuação, coerência, conjugação verbal e ritmo do texto."
      noChangesMessage="Seu texto já está bem escrito!"
      runAnalysis={(text) => aiProvider.reviewChapterQuality(text)}
    />
  )
}
