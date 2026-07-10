import { useEffect, useState } from 'react'
import { Check, FileText, LayoutGrid, Layers3, X } from 'lucide-react'
import { subscribeToGridStructures } from '@/services/firestore/gridStructures'
import { getPageFormat } from '@/constants/pageFormats'
import type { ChapterGrid, GridStructure } from '@/types'
import { chapterGridSelectorCss as css } from './css'

interface ChapterGridSelectorProps {
  projectId: string
  currentGrid?: ChapterGrid
  onApplyCurrent: (grid: ChapterGrid) => Promise<void>
  onApplyAll: (grid: ChapterGrid) => Promise<void>
}

function toChapterGrid(structure: GridStructure): ChapterGrid {
  const { id, projectId, createdAt, updatedAt, ...draft } = structure
  return {
    ...draft,
    sourceStructureId: id,
    sourceStructureName: structure.name,
  }
}

export function ChapterGridSelector({ projectId, currentGrid, onApplyCurrent, onApplyAll }: ChapterGridSelectorProps) {
  const [open, setOpen] = useState(false)
  const [structures, setStructures] = useState<GridStructure[]>([])
  const [selectedId, setSelectedId] = useState(currentGrid?.sourceStructureId ?? '')
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState<'current' | 'all' | null>(null)

  useEffect(() => subscribeToGridStructures(projectId, (items) => {
    setStructures(items)
    setLoading(false)
  }), [projectId])

  useEffect(() => {
    setSelectedId(currentGrid?.sourceStructureId ?? '')
  }, [currentGrid?.sourceStructureId])

  const selected = structures.find((structure) => structure.id === selectedId)

  const apply = async (scope: 'current' | 'all') => {
    if (!selected) return
    setApplying(scope)
    try {
      const grid = toChapterGrid(selected)
      if (scope === 'all') await onApplyAll(grid)
      else await onApplyCurrent(grid)
      setOpen(false)
    } finally {
      setApplying(null)
    }
  }

  return (
    <>
      <button className={css.trigger} type="button" onClick={() => setOpen(true)} title="Aplicar grid de página">
        <LayoutGrid size={15} />
        <span>{currentGrid?.sourceStructureName ?? 'Aplicar grid'}</span>
      </button>

      {open && (
        <div className={css.overlay} onMouseDown={() => setOpen(false)}>
          <div className={css.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.header}>
              <div>
                <p className={css.eyebrow}>Formatação do capítulo</p>
                <h2>Aplicar grid de página</h2>
                <p>Escolha um modelo salvo na aba Estrutura.</p>
              </div>
              <button className={css.close} type="button" onClick={() => setOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.content}>
              {loading ? (
                <div className={css.empty}>Carregando grids...</div>
              ) : structures.length ? (
                <div className={css.gridList}>
                  {structures.map((structure) => {
                    const format = getPageFormat(structure.pageFormat)
                    const active = selectedId === structure.id
                    return (
                      <button
                        className={active ? css.gridCardActive : css.gridCard}
                        type="button"
                        key={structure.id}
                        onClick={() => setSelectedId(structure.id)}
                      >
                        <span className={css.paperIcon}><FileText size={21} /></span>
                        <span className={css.gridInfo}>
                          <strong>{structure.name}</strong>
                          <small>{format.name} · {structure.orientation === 'portrait' ? 'Retrato' : 'Paisagem'} · {structure.columns} coluna{structure.columns > 1 ? 's' : ''}</small>
                          <small>{structure.fontFamily.split(',')[0].replace(/'/g, '')} · {structure.fontSize} pt · entrelinha {structure.lineHeight}</small>
                        </span>
                        {active && <span className={css.check}><Check size={14} /></span>}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className={css.empty}>
                  <LayoutGrid size={28} />
                  <strong>Nenhum grid criado</strong>
                  <span>Crie um modelo em Estrutura → Grid antes de aplicá-lo.</span>
                </div>
              )}
            </div>

            <footer className={css.footer}>
              <button className={css.secondary} type="button" onClick={() => setOpen(false)}>Cancelar</button>
              <button className={css.secondaryAction} type="button" disabled={!selected || !!applying} onClick={() => apply('current')}>
                <FileText size={15} /> {applying === 'current' ? 'Aplicando...' : 'Aplicar neste capítulo'}
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
