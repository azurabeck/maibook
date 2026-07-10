import { useEffect, useState } from 'react'
import { Image as ImageIcon, PanelTop, RefreshCw, Trash2, X } from 'lucide-react'
import type { ChapterHeader as ChapterHeaderValue, HeaderStructure, HeaderStructureDraft } from '@/types'
import { subscribeToHeaderStructures } from '@/services/firestore/headerStructures'
import { chapterHeaderCss } from './css'
import type { ChapterHeaderProps, HeaderTemplatePreviewProps } from './type'

function HeaderPreview({ structure, compact = false, editable = false, onTextChange }: HeaderTemplatePreviewProps) {
  const hasImage = structure.layout === 'image-text' || structure.layout === 'image-only'
  const hasPrimaryText = structure.layout !== 'image-only'
  const hasSecondaryText = structure.layout === 'text-text'

  const primaryStyle = {
    paddingTop: structure.textStartSpacing,
    fontFamily: structure.fontFamily,
    fontSize: compact ? Math.max(12, Math.min(structure.fontSize * 0.52, 20)) : structure.fontSize,
    fontWeight: structure.bold ? 700 : 400,
    textAlign: structure.textAlignment,
  } as const

  const secondaryStyle = {
    fontFamily: structure.fontFamily,
    fontSize: compact ? Math.max(9, Math.min(structure.secondaryFontSize * 0.58, 14)) : structure.secondaryFontSize,
    fontWeight: structure.bold ? 700 : 400,
    textAlign: structure.textAlignment,
  } as const

  return (
    <div
      className={chapterHeaderCss.preview}
      style={{
        gap: compact ? Math.min(structure.rowGap, 10) : structure.rowGap,
        paddingTop: structure.borderTop ? 8 : 0,
        paddingBottom: structure.borderBottom ? 8 : 0,
        borderTop: structure.borderTop ? '1px solid currentColor' : 'none',
        borderBottom: structure.borderBottom ? '1px solid currentColor' : 'none',
      }}
    >
      {hasImage && (
        <div
          className={chapterHeaderCss.imageRow}
          style={{
            height: compact ? Math.min(structure.imageHeight, 72) : structure.imageHeight,
            justifyContent:
              structure.imageAlignment === 'left'
                ? 'flex-start'
                : structure.imageAlignment === 'right'
                  ? 'flex-end'
                  : 'center',
          }}
        >
          {structure.imageUrl ? (
            <img
              className={chapterHeaderCss.image}
              src={structure.imageUrl}
              alt="Imagem do cabeçalho"
              style={{
                width: compact ? Math.min(structure.imageWidth, 220) : structure.imageWidth,
                height: compact ? Math.min(structure.imageHeight, 72) : structure.imageHeight,
                objectFit: structure.imageObjectFit,
              }}
            />
          ) : (
            <div className={chapterHeaderCss.imagePlaceholder}>
              <ImageIcon size={compact ? 16 : 24} />
              {!compact && <span>Imagem do cabeçalho</span>}
            </div>
          )}
        </div>
      )}

      {hasPrimaryText && (editable ? (
        <textarea
          className={chapterHeaderCss.editableText}
          style={primaryStyle}
          value={structure.primaryText}
          rows={1}
          placeholder="Texto principal"
          onChange={(event) => onTextChange?.('primaryText', event.target.value)}
        />
      ) : (
        <p className={chapterHeaderCss.text} style={primaryStyle}>{structure.primaryText || 'Texto principal'}</p>
      ))}

      {hasSecondaryText && (editable ? (
        <textarea
          className={chapterHeaderCss.editableText}
          style={secondaryStyle}
          value={structure.secondaryText}
          rows={1}
          placeholder="Texto secundário"
          onChange={(event) => onTextChange?.('secondaryText', event.target.value)}
        />
      ) : (
        <p className={chapterHeaderCss.text} style={secondaryStyle}>{structure.secondaryText || 'Texto secundário'}</p>
      ))}
    </div>
  )
}

function toChapterHeader(structure: HeaderStructure): ChapterHeaderValue {
  const { id, projectId: _projectId, createdAt: _createdAt, updatedAt: _updatedAt, ...model } = structure
  return { ...model, sourceStructureId: id, sourceStructureName: structure.name }
}

export function ChapterHeader({ projectId, value, onChange }: ChapterHeaderProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [structures, setStructures] = useState<HeaderStructure[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!modalOpen) return
    setLoading(true)
    return subscribeToHeaderStructures(projectId, (items) => {
      setStructures(items)
      setLoading(false)
    })
  }, [modalOpen, projectId])

  function updateText(field: 'primaryText' | 'secondaryText', text: string) {
    if (value) onChange({ ...value, [field]: text })
  }

  return (
    <>
      {!value ? (
        <button className={chapterHeaderCss.emptyAction} type="button" onClick={() => setModalOpen(true)}>
          <span className={chapterHeaderCss.emptyIcon}><PanelTop size={17} /></span>
          <span><strong>Importar cabeçalho</strong><small>Use um modelo criado em Estruturas → Cabeçalho</small></span>
        </button>
      ) : (
        <section className={chapterHeaderCss.wrapper}>
          <div className={chapterHeaderCss.topbar}>
            <div><span className={chapterHeaderCss.eyebrow}>Cabeçalho do capítulo</span><strong className={chapterHeaderCss.modelName}>{value.sourceStructureName}</strong></div>
            <div className={chapterHeaderCss.actions}>
              <button type="button" onClick={() => setModalOpen(true)}><RefreshCw size={14} /> Trocar</button>
              <button className={chapterHeaderCss.removeButton} type="button" onClick={() => onChange(null)}><Trash2 size={14} /> Remover</button>
            </div>
          </div>
          <div className={chapterHeaderCss.canvas}>
            <HeaderPreview structure={value} editable onTextChange={updateText} />
          </div>
          <p className={chapterHeaderCss.hint}>Neste capítulo, apenas os textos do modelo podem ser alterados.</p>
        </section>
      )}

      {modalOpen && (
        <div className={chapterHeaderCss.overlay} onMouseDown={() => setModalOpen(false)}>
          <div className={chapterHeaderCss.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={chapterHeaderCss.modalHeader}>
              <div><span className={chapterHeaderCss.eyebrow}>Modelos do projeto</span><h3>Importar cabeçalho</h3><p>O modelo visual será copiado. No capítulo, somente os textos poderão ser editados.</p></div>
              <button className={chapterHeaderCss.closeButton} type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </header>
            <div className={chapterHeaderCss.modalBody}>
              {loading ? <div className={chapterHeaderCss.modalState}>Carregando modelos...</div> : structures.length === 0 ? (
                <div className={chapterHeaderCss.modalState}><PanelTop size={24} /><strong>Nenhum cabeçalho criado</strong><span>Crie um modelo primeiro em Estruturas → Cabeçalho.</span></div>
              ) : (
                <div className={chapterHeaderCss.grid}>
                  {structures.map((structure) => (
                    <article className={chapterHeaderCss.card} key={structure.id}>
                      <div className={chapterHeaderCss.cardPreview}><HeaderPreview structure={structure} compact /></div>
                      <div className={chapterHeaderCss.cardFooter}>
                        <div><strong>{structure.name}</strong><span>{getLayoutLabel(structure.layout)}</span></div>
                        <button type="button" onClick={() => { onChange(toChapterHeader(structure)); setModalOpen(false) }}>Usar modelo</button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function getLayoutLabel(layout: HeaderStructureDraft['layout']) {
  if (layout === 'image-text') return 'Imagem e texto'
  if (layout === 'text-only') return 'Apenas texto'
  if (layout === 'text-text') return 'Dois textos'
  return 'Apenas imagem'
}
