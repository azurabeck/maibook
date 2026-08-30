import { useState } from 'react'
import { Check, RefreshCw, X, type LucideIcon } from 'lucide-react'
import { buildDiffBlocks, hasChanges, renderContent, type DiffBlock } from '@/utils/diffBlocks'
import { aiReviewModalCss as css } from './css'

interface AiReviewModalProps {
  content: string
  onApply: (newContent: string) => void
  triggerIcon: LucideIcon
  triggerLabel: string
  triggerTitle: string
  modalEyebrow: string
  modalTitle: string
  modalDescription: string
  noChangesMessage: string
  runAnalysis: (text: string) => Promise<string>
}

type Status = 'idle' | 'loading' | 'done' | 'no-changes' | 'error'

export function AiReviewModal({
  content,
  onApply,
  triggerIcon: TriggerIcon,
  triggerLabel,
  triggerTitle,
  modalEyebrow,
  modalTitle,
  modalDescription,
  noChangesMessage,
  runAnalysis,
}: AiReviewModalProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [blocks, setBlocks] = useState<DiffBlock[]>([])

  async function runCheck() {
    setStatus('loading')
    setErrorMessage('')
    try {
      const revised = await runAnalysis(content)
      const newBlocks = buildDiffBlocks(content, revised)
      setBlocks(newBlocks)
      setStatus(hasChanges(newBlocks) ? 'done' : 'no-changes')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Não foi possível verificar o texto agora.')
      setStatus('error')
    }
  }

  function handleOpen() {
    setOpen(true)
    void runCheck()
  }

  function applyChange(id: number) {
    const updated = blocks.map((block) =>
      block.type === 'change' && block.id === id ? { ...block, applied: true } : block,
    )
    setBlocks(updated)
    onApply(renderContent(updated))
  }

  function applyAll() {
    const updated = blocks.map((block) => (block.type === 'change' ? { ...block, applied: true } : block))
    setBlocks(updated)
    onApply(renderContent(updated))
  }

  const pendingChanges = blocks.some((block) => block.type === 'change' && !block.applied)

  return (
    <>
      <button className={css.trigger} type="button" onClick={handleOpen} disabled={!content.trim()} title={triggerTitle}>
        <TriggerIcon size={15} />
        <span>{triggerLabel}</span>
      </button>

      {open && (
        <div className={css.overlay} onMouseDown={() => setOpen(false)}>
          <div className={css.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.header}>
              <div>
                <p className={css.eyebrow}>{modalEyebrow}</p>
                <h2>{modalTitle}</h2>
                <p>{modalDescription}</p>
              </div>
              <button className={css.close} type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.content}>
              {status === 'loading' && (
                <div className={css.state}>
                  <span className={css.spinner} />
                  <strong>Analisando o capítulo...</strong>
                  <span>Isso pode levar alguns segundos.</span>
                </div>
              )}

              {status === 'error' && (
                <div className={css.state}>
                  <strong>Não foi possível verificar o texto</strong>
                  <span>{errorMessage}</span>
                </div>
              )}

              {status === 'no-changes' && (
                <div className={css.state}>
                  <strong>Nenhuma alteração sugerida</strong>
                  <span>{noChangesMessage}</span>
                </div>
              )}

              {status === 'done' && (
                <div className={css.columns}>
                  <div>
                    <p className={css.columnTitle}>Texto original</p>
                    <div className={css.text}>
                      {blocks.map((block, index) =>
                        block.type === 'context' ? (
                          <span key={index}>{block.text}</span>
                        ) : block.original ? (
                          <span key={index} className={block.applied ? css.removedApplied : css.removed}>{block.original}</span>
                        ) : null,
                      )}
                    </div>
                  </div>

                  <div>
                    <p className={css.columnTitle}>Sugestão da IA</p>
                    <div className={css.text}>
                      {blocks.map((block, index) => {
                        if (block.type === 'context') return <span key={index}>{block.text}</span>
                        if (!block.suggested) return null

                        return (
                          <span key={index} className={block.applied ? css.addedWrapApplied : css.addedWrap}>
                            <span className={css.added}>{block.suggested}</span>
                            <button
                              type="button"
                              className={block.applied ? css.applyBtnApplied : css.applyBtn}
                              onClick={() => !block.applied && applyChange(block.id)}
                              disabled={block.applied}
                              title={block.applied ? 'Alteração aplicada' : 'Aplicar esta alteração'}
                            >
                              <Check size={11} />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className={css.footer}>
              <button className={css.secondary} type="button" onClick={() => setOpen(false)}>Fechar</button>
              <button className={css.secondaryAction} type="button" disabled={status === 'loading'} onClick={() => void runCheck()}>
                <RefreshCw size={14} /> Verificar novamente
              </button>
              {status === 'done' && (
                <button className={css.primary} type="button" disabled={!pendingChanges} onClick={applyAll}>
                  <Check size={15} /> Aplicar todas as alterações
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
