import { useEffect, useMemo, useState } from 'react'
import { Check, FileDown, Layers3, X } from 'lucide-react'
import { subscribeToFooterStructures } from '@/services/firestore/footerStructures'
import type { ChapterFooter, FooterStructure } from '@/types'
import { chapterFooterSelectorCss as css } from './css'

interface ChapterFooterSelectorProps {
  projectId: string
  currentFooter?: ChapterFooter
  onApplyCurrent: (footer: ChapterFooter) => Promise<void>
  onApplyAll: (footer: ChapterFooter) => Promise<void>
}

function toChapterFooter(structure: FooterStructure, noteText: string): ChapterFooter {
  const { id, projectId, createdAt, updatedAt, ...draft } = structure
  return {
    ...draft,
    noteText,
    sourceStructureId: id,
    sourceStructureName: structure.name,
  }
}

function hasEditableNote(structure?: FooterStructure) {
  return structure?.items.some((item) => item.type === 'note') ?? false
}

export function ChapterFooterSelector({
  projectId,
  currentFooter,
  onApplyCurrent,
  onApplyAll,
}: ChapterFooterSelectorProps) {
  const [open, setOpen] = useState(false)
  const [structures, setStructures] = useState<FooterStructure[]>([])
  const [selectedId, setSelectedId] = useState(currentFooter?.sourceStructureId ?? '')
  const [noteText, setNoteText] = useState(currentFooter?.noteText ?? '')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<'current' | 'all' | null>(null)

  useEffect(() => subscribeToFooterStructures(projectId, (items) => {
    setStructures(items)
    setLoading(false)
  }), [projectId])

  useEffect(() => {
    setSelectedId(currentFooter?.sourceStructureId ?? '')
    setNoteText(currentFooter?.noteText ?? '')
  }, [currentFooter?.sourceStructureId, currentFooter?.noteText])

  const selected = useMemo(
    () => structures.find((structure) => structure.id === selectedId),
    [selectedId, structures],
  )

  const selectStructure = (structure: FooterStructure) => {
    setSelectedId(structure.id)
    setNoteText(
      currentFooter?.sourceStructureId === structure.id
        ? currentFooter.noteText
        : structure.noteText,
    )
  }

  const apply = async (scope: 'current' | 'all') => {
    if (!selected) return
    setApplying(scope)
    try {
      const footer = toChapterFooter(selected, noteText)
      if (scope === 'all') await onApplyAll(footer)
      else await onApplyCurrent(footer)
      setOpen(false)
    } finally {
      setApplying(null)
    }
  }

  return (
    <>
      <button className={css.trigger} type="button" onClick={() => setOpen(true)} title="Aplicar footer">
        <FileDown size={15} />
        <span>{currentFooter?.sourceStructureName ?? 'Aplicar footer'}</span>
      </button>

      {open && (
        <div className={css.overlay} onMouseDown={() => setOpen(false)}>
          <div className={css.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.header}>
              <div>
                <p className={css.eyebrow}>Rodapé do capítulo</p>
                <h2>Aplicar footer</h2>
                <p>Escolha um modelo salvo e personalize a nota quando ela fizer parte do footer.</p>
              </div>
              <button className={css.close} type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.content}>
              {loading ? (
                <div className={css.empty}>Carregando footers...</div>
              ) : structures.length ? (
                <>
                  <div className={css.list}>
                    {structures.map((structure) => {
                      const active = selectedId === structure.id
                      return (
                        <button
                          className={active ? css.cardActive : css.card}
                          type="button"
                          key={structure.id}
                          onClick={() => selectStructure(structure)}
                        >
                          <span className={css.icon}><FileDown size={20} /></span>
                          <span className={css.info}>
                            <strong>{structure.name}</strong>
                            <small>{structure.items.map((item) => item.type === 'note' ? 'Nota' : item.type === 'chapter-title' ? 'Capítulo' : 'Número').join(' · ')}</small>
                            <small>{structure.fontFamily.split(',')[0].replace(/'/g, '')} · {structure.fontSize} pt</small>
                          </span>
                          {active && <span className={css.check}><Check size={14} /></span>}
                        </button>
                      )
                    })}
                  </div>

                  {hasEditableNote(selected) && (
                    <label className={css.noteField}>
                      <span>Nota de rodapé deste capítulo</span>
                      <textarea
                        value={noteText}
                        onChange={(event) => setNoteText(event.target.value)}
                        placeholder="Digite a nota que aparecerá no rodapé..."
                        rows={3}
                      />
                      <small>O texto fica salvo junto ao capítulo. Assim, cada capítulo pode ter uma nota diferente usando o mesmo modelo.</small>
                    </label>
                  )}
                </>
              ) : (
                <div className={css.empty}>
                  <FileDown size={28} />
                  <strong>Nenhum footer criado</strong>
                  <span>Crie um modelo em Estrutura → Footer antes de aplicá-lo.</span>
                </div>
              )}
            </div>

            <footer className={css.footer}>
              <button className={css.secondary} type="button" onClick={() => setOpen(false)}>Cancelar</button>
              <button className={css.secondaryAction} type="button" disabled={!selected || !!applying} onClick={() => apply('current')}>
                <FileDown size={15} /> {applying === 'current' ? 'Aplicando...' : 'Aplicar neste capítulo'}
              </button>
              <button className={css.primary} type="button" disabled={!selected || !!applying} onClick={() => apply('all')}>
                <Layers3 size={15} /> {applying === 'all' ? 'Aplicando...' : 'Aplicar em todos'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
