import { useEffect, useMemo, useState } from 'react'
import {
  Bold,
  Image as ImageIcon,
  Pencil,
  Plus,
  Save,
  Trash2,
  Type,
  X,
} from 'lucide-react'
import {
  createHeaderStructure,
  deleteHeaderStructure,
  subscribeToHeaderStructures,
  updateHeaderStructure,
} from '@/services/firestore/headerStructures'
import type { HeaderStructure, HeaderStructureDraft, HeaderStructureLayout } from '@/types'
import { headerStructureManagerCss as css } from './css'
import type {
  HeaderLayoutOption,
  HeaderStructureCardProps,
  HeaderStructureEditorProps,
  HeaderStructureManagerProps,
} from './type'

const layoutOptions: HeaderLayoutOption[] = [
  {
    id: 'image-text',
    title: 'Imagem + texto',
    description: 'Imagem em cima e texto embaixo',
  },
  {
    id: 'text-only',
    title: 'Apenas texto',
    description: 'Uma única linha de texto',
  },
  {
    id: 'text-text',
    title: 'Texto + texto',
    description: 'Duas linhas independentes',
  },
  {
    id: 'image-only',
    title: 'Apenas imagem',
    description: 'Cabeçalho totalmente visual',
  },
]

const defaultDraft: HeaderStructureDraft = {
  name: '',
  layout: 'image-text',
  primaryText: 'Título do livro',
  secondaryText: 'Nome do autor',
  imageUrl: '',
  imageHeight: 100,
  imageWidth: 320,
  imageObjectFit: 'contain',
  textAlignment: 'center',
  imageAlignment: 'center',
  fontSize: 24,
  secondaryFontSize: 14,
  fontFamily: 'Georgia, serif',
  bold: true,
  rowGap: 12,
  textStartSpacing: 0,
  borderTop: false,
  borderBottom: true,
}

function getLayoutLabel(layout: HeaderStructureLayout) {
  return layoutOptions.find((option) => option.id === layout)?.title ?? layout
}

function LayoutDiagram({ layout }: { layout: HeaderStructureLayout }) {
  if (layout === 'image-text') {
    return (
      <div className={css.layoutDiagram}>
        <span className={css.layoutDiagramImage} />
        <span className={css.layoutDiagramRow} />
      </div>
    )
  }

  if (layout === 'text-only') {
    return (
      <div className={css.layoutDiagram}>
        <span className={css.layoutDiagramRow} />
      </div>
    )
  }

  if (layout === 'text-text') {
    return (
      <div className={css.layoutDiagram}>
        <span className={css.layoutDiagramRow} />
        <span className={css.layoutDiagramRow} />
      </div>
    )
  }

  return (
    <div className={css.layoutDiagram}>
      <span className={css.layoutDiagramImage} />
    </div>
  )
}

function HeaderPreview({ structure, compact = false }: { structure: HeaderStructureDraft; compact?: boolean }) {
  const hasImage = structure.layout === 'image-text' || structure.layout === 'image-only'
  const hasPrimaryText = structure.layout !== 'image-only'
  const hasSecondaryText = structure.layout === 'text-text'

  const previewStyle = {
    textAlign: structure.textAlignment,
    gap: compact ? Math.min(structure.rowGap, 10) : structure.rowGap,
    paddingTop: structure.borderTop ? 8 : 0,
    paddingBottom: structure.borderBottom ? 8 : 0,
    borderTop: structure.borderTop ? '1px solid currentColor' : 'none',
    borderBottom: structure.borderBottom ? '1px solid currentColor' : 'none',
  }

  const primaryStyle = {
    paddingTop: structure.textStartSpacing,
    fontFamily: structure.fontFamily,
    fontSize: compact ? Math.max(12, Math.min(structure.fontSize * 0.52, 20)) : structure.fontSize,
    fontWeight: structure.bold ? 700 : 400,
    textAlign: structure.textAlignment ?? 'center',
  }

  const secondaryStyle = {
    fontFamily: structure.fontFamily,
    fontSize: compact
      ? Math.max(9, Math.min(structure.secondaryFontSize * 0.58, 14))
      : structure.secondaryFontSize,
    fontWeight: structure.bold ? 700 : 400,
    textAlign: structure.textAlignment ?? 'center',
  }

  return (
    <div className={css.preview} style={previewStyle}>
      {hasImage && (
        <div
          className={css.previewImage}
          style={{
            height: compact ? Math.min(structure.imageHeight, 72) : structure.imageHeight,
            display: 'flex',
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
              src={structure.imageUrl}
              alt="Prévia do cabeçalho"
              style={{
                width: compact ? Math.min(structure.imageWidth ?? 320, 220) : (structure.imageWidth ?? 320),
                height: compact ? Math.min(structure.imageHeight, 72) : structure.imageHeight,
                objectFit: structure.imageObjectFit ?? 'contain',
                maxWidth: '100%',
              }}
            />
          ) : (
            <div className={css.previewImagePlaceholder}>
              <ImageIcon size={compact ? 16 : 26} strokeWidth={1.6} />
              {!compact && <span>Imagem do cabeçalho</span>}
            </div>
          )}
        </div>
      )}

      {hasPrimaryText && (
        <p className={css.previewText} style={primaryStyle}>
          {structure.primaryText || 'Título do cabeçalho'}
        </p>
      )}

      {hasSecondaryText && (
        <p className={css.previewText} style={secondaryStyle}>
          {structure.secondaryText || 'Texto secundário'}
        </p>
      )}
    </div>
  )
}

function HeaderStructureCard({ structure, onEdit, onDelete }: HeaderStructureCardProps) {
  return (
    <article className={css.card}>
      <div className={css.cardPreview}>
        <HeaderPreview structure={structure} compact />
      </div>
      <div className={css.cardBody}>
        <div className={css.cardHeading}>
          <h3 className={css.cardName}>{structure.name}</h3>
          <div className={css.cardActions}>
            <button
              className={css.cardAction}
              type="button"
              aria-label={`Editar ${structure.name}`}
              onClick={() => onEdit(structure)}
            >
              <Pencil size={15} />
            </button>
            <button
              className={css.cardActionDanger}
              type="button"
              aria-label={`Excluir ${structure.name}`}
              onClick={() => onDelete(structure)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        <p className={css.cardMeta}>{getLayoutLabel(structure.layout)}</p>
      </div>
    </article>
  )
}

function HeaderStructureEditor({ initialValue, onCancel, onSave }: HeaderStructureEditorProps) {
  const [form, setForm] = useState<HeaderStructureDraft>(() => ({ ...defaultDraft, ...(initialValue ?? {}) }))
  const [saving, setSaving] = useState(false)

  const setField = <Key extends keyof HeaderStructureDraft>(
    field: Key,
    value: HeaderStructureDraft[Key],
  ) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      await onSave({ ...form, name: form.name.trim() })
    } finally {
      setSaving(false)
    }
  }

  const showImageFields = form.layout === 'image-text' || form.layout === 'image-only'
  const showPrimaryText = form.layout !== 'image-only'
  const showSecondaryText = form.layout === 'text-text'

  return (
    <div className={css.overlay} role="presentation" onMouseDown={onCancel}>
      <div
        className={css.editor}
        role="dialog"
        aria-modal="true"
        aria-labelledby="header-editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className={css.editorHeader}>
          <div>
            <p className={css.editorEyebrow}>Estrutura de página</p>
            <h2 className={css.editorTitle} id="header-editor-title">
              {initialValue ? 'Editar cabeçalho' : 'Criar cabeçalho'}
            </h2>
            <p className={css.editorSubtitle}>
              Escolha uma composição e ajuste cada detalhe vendo o resultado em tempo real.
            </p>
          </div>
          <button className={css.editorClose} type="button" onClick={onCancel} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>

        <div className={css.editorContent}>
          <div className={css.controls}>
            <section className={css.section}>
              <h3 className={css.sectionTitle}>1. Estrutura fixa</h3>
              <div className={css.layoutGrid}>
                {layoutOptions.map((option) => (
                  <button
                    className={form.layout === option.id ? css.layoutOptionActive : css.layoutOption}
                    type="button"
                    key={option.id}
                    onClick={() => setField('layout', option.id)}
                  >
                    <LayoutDiagram layout={option.id} />
                    <span className={css.layoutTitle}>{option.title}</span>
                    <span className={css.layoutDescription}>{option.description}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className={css.section}>
              <h3 className={css.sectionTitle}>2. Conteúdo</h3>
              <label className={css.field}>
                <span className={css.fieldLabel}>Nome da estrutura</span>
                <input
                  className={css.input}
                  value={form.name}
                  onChange={(event) => setField('name', event.target.value)}
                  placeholder="Ex.: Cabeçalho dos capítulos"
                  autoFocus
                />
              </label>

              {showImageFields && (
                <label className={css.field}>
                  <span className={css.fieldLabel}>URL da imagem</span>
                  <input
                    className={css.input}
                    value={form.imageUrl}
                    onChange={(event) => setField('imageUrl', event.target.value)}
                    placeholder="https://..."
                  />
                </label>
              )}

              {showPrimaryText && (
                <label className={css.field}>
                  <span className={css.fieldLabel}>Texto principal</span>
                  <textarea
                    className={css.textarea}
                    value={form.primaryText}
                    onChange={(event) => setField('primaryText', event.target.value)}
                  />
                </label>
              )}

              {showSecondaryText && (
                <label className={css.field}>
                  <span className={css.fieldLabel}>Texto secundário</span>
                  <textarea
                    className={css.textarea}
                    value={form.secondaryText}
                    onChange={(event) => setField('secondaryText', event.target.value)}
                  />
                </label>
              )}
            </section>

            <section className={css.section}>
              <h3 className={css.sectionTitle}>3. Aparência</h3>

              {showImageFields && (
                <>
                  <label className={css.field}>
                    <span className={css.rangeHead}><span className={css.fieldLabel}>Altura da imagem</span><span className={css.rangeValue}>{form.imageHeight}px</span></span>
                    <input className={css.range} type="range" min="50" max="500" value={form.imageHeight} onChange={(event) => setField('imageHeight', Number(event.target.value))} />
                  </label>
                  <label className={css.field}>
                    <span className={css.rangeHead}><span className={css.fieldLabel}>Largura da imagem</span><span className={css.rangeValue}>{form.imageWidth}px</span></span>
                    <input className={css.range} type="range" min="50" max="900" value={form.imageWidth} onChange={(event) => setField('imageWidth', Number(event.target.value))} />
                  </label>
                  <label className={css.field}>
                    <span className={css.fieldLabel}>Object fit</span>
                    <select className={css.select} value={form.imageObjectFit} onChange={(event) => setField('imageObjectFit', event.target.value as HeaderStructureDraft['imageObjectFit'])}>
                      <option value="contain">Contain</option><option value="cover">Cover</option><option value="fill">Fill</option>
                    </select>
                  </label>
                  <div className={css.field}>
                    <span className={css.fieldLabel}>Alinhamento da imagem</span>
                    <div className="header-structure-alignment-group">
                      {(['left', 'center', 'right'] as const).map((alignment) => (
                        <button key={alignment} type="button" className={`header-structure-alignment-button ${form.imageAlignment === alignment ? 'is-active' : ''}`} onClick={() => setField('imageAlignment', alignment)}>
                          {alignment === 'left' ? 'Esquerda' : alignment === 'center' ? 'Centro' : 'Direita'}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {showPrimaryText && (
                <div className={css.field}>
                  <span className={css.fieldLabel}>Alinhamento do texto</span>
                  <div className="header-structure-alignment-group">
                    {(['left', 'center', 'right'] as const).map((alignment) => (
                      <button key={alignment} type="button" className={`header-structure-alignment-button ${form.textAlignment === alignment ? 'is-active' : ''}`} onClick={() => setField('textAlignment', alignment)}>
                        {alignment === 'left' ? 'Esquerda' : alignment === 'center' ? 'Centro' : 'Direita'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showPrimaryText && (
                <div className={css.row}>
                  <label className={css.field}>
                    <span className={css.fieldLabel}>Fonte</span>
                    <select
                      className={css.select}
                      value={form.fontFamily}
                      onChange={(event) => setField('fontFamily', event.target.value)}
                    >
                      <option value="Inter, sans-serif">Inter</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Times New Roman', serif">Times New Roman</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Courier New', monospace">Courier New</option>
                    </select>
                  </label>
                  <label className={css.field}>
                    <span className={css.fieldLabel}>Tamanho principal</span>
                    <input
                      className={css.input}
                      type="number"
                      min="8"
                      max="72"
                      value={form.fontSize}
                      onChange={(event) => setField('fontSize', Number(event.target.value))}
                    />
                  </label>
                </div>
              )}

              {showSecondaryText && (
                <label className={css.field}>
                  <span className={css.fieldLabel}>Tamanho secundário</span>
                  <input
                    className={css.input}
                    type="number"
                    min="8"
                    max="72"
                    value={form.secondaryFontSize}
                    onChange={(event) => setField('secondaryFontSize', Number(event.target.value))}
                  />
                </label>
              )}

              <div className={css.row}>
                <label className={css.field}>
                  <span className={css.rangeHead}>
                    <span className={css.fieldLabel}>Espaço entre linhas</span>
                    <span className={css.rangeValue}>{form.rowGap}px</span>
                  </span>
                  <input
                    className={css.range}
                    type="range"
                    min="0"
                    max="64"
                    value={form.rowGap}
                    onChange={(event) => setField('rowGap', Number(event.target.value))}
                  />
                </label>
                <label className={css.field}>
                  <span className={css.rangeHead}>
                    <span className={css.fieldLabel}>Início do texto</span>
                    <span className={css.rangeValue}>{form.textStartSpacing}px</span>
                  </span>
                  <input
                    className={css.range}
                    type="range"
                    min="0"
                    max="80"
                    value={form.textStartSpacing}
                    onChange={(event) => setField('textStartSpacing', Number(event.target.value))}
                  />
                </label>
              </div>

              <div className={css.toggles}>
                <button
                  className={form.bold ? css.toggleActive : css.toggle}
                  type="button"
                  onClick={() => setField('bold', !form.bold)}
                >
                  <Bold size={14} /> Negrito
                </button>
                <button
                  className={form.borderTop ? css.toggleActive : css.toggle}
                  type="button"
                  onClick={() => setField('borderTop', !form.borderTop)}
                >
                  Borda superior
                </button>
                <button
                  className={form.borderBottom ? css.toggleActive : css.toggle}
                  type="button"
                  onClick={() => setField('borderBottom', !form.borderBottom)}
                >
                  Borda inferior
                </button>
              </div>
            </section>
          </div>

          <div className={css.previewArea}>
            <p className={css.previewLabel}>Prévia em tempo real</p>
            <div className={css.previewPaper}>
              <HeaderPreview structure={form} />
            </div>
          </div>
        </div>

        <footer className={css.footer}>
          <button className={css.secondaryButton} type="button" onClick={onCancel}>
            Cancelar
          </button>
          <button
            className={css.primaryButton}
            type="button"
            disabled={!form.name.trim() || saving}
            onClick={handleSave}
          >
            <Save size={15} />

            {saving ? 'Salvando...' : 'Salvar cabeçalho'}
          </button>
        </footer>
      </div>
    </div>
  )
}

export function HeaderStructureManager({ projectId }: HeaderStructureManagerProps) {
  const [structures, setStructures] = useState<HeaderStructure[]>([])
  const [editing, setEditing] = useState<HeaderStructure | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToHeaderStructures(projectId, (nextStructures) => {
      setStructures(nextStructures)
      setLoading(false)
    })

    return unsubscribe
  }, [projectId])

  const emptyMessage = useMemo(() => {
    if (loading) return 'Carregando cabeçalhos...'
    return 'Crie seu primeiro modelo para reutilizar nos capítulos do livro.'
  }, [loading])

  const openCreate = () => {
    setEditing(null)
    setError('')
    setEditorOpen(true)
  }

  const openEdit = (structure: HeaderStructure) => {
    setEditing(structure)
    setError('')
    setEditorOpen(true)
  }

  const handleSave = async (draft: HeaderStructureDraft) => {
    setError('')
    try {
      if (editing) {
        await updateHeaderStructure(projectId, editing.id, draft)
      } else {
        await createHeaderStructure(projectId, draft)
      }
      setEditorOpen(false)
      setEditing(null)
    } catch (saveError) {
      console.error('Falha ao salvar estrutura de cabeçalho:', saveError)
      setError('Não foi possível salvar. Verifique sua conexão e as regras do Firestore.')
      throw saveError
    }
  }

  const handleDelete = async (structure: HeaderStructure) => {
    const confirmed = window.confirm(`Excluir o cabeçalho “${structure.name}”?`)
    if (!confirmed) return

    try {
      await deleteHeaderStructure(projectId, structure.id)
    } catch (deleteError) {
      console.error('Falha ao excluir estrutura de cabeçalho:', deleteError)
      setError('Não foi possível excluir este cabeçalho.')
    }
  }

  return (
    <div className={css.root}>
      <div className={css.intro}>
        <div>
          <h2 className={css.title}>Cabeçalhos do livro</h2>
          <p className={css.description}>
            Monte modelos reutilizáveis para manter títulos, imagens e divisórias consistentes em
            todos os capítulos.
          </p>
        </div>
        <button className={css.add} type="button" onClick={openCreate} aria-label="Criar cabeçalho">
          <Plus size={23} />
        </button>
      </div>

      {error && <p className={css.error}>{error}</p>}

      {structures.length > 0 ? (
        <div className={css.grid}>
          {structures.map((structure) => (
            <HeaderStructureCard
              key={structure.id}
              structure={structure}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className={css.empty}>
          <div>
            <div className={css.emptyIcon}>
              {loading ? <Type size={22} /> : <Plus size={22} />}
            </div>
            <h3 className={css.emptyTitle}>{loading ? 'Buscando estruturas' : 'Nenhum cabeçalho criado'}</h3>
            <p className={css.emptyText}>{emptyMessage}</p>
          </div>
        </div>
      )}

      {editorOpen && (
        <HeaderStructureEditor
          initialValue={editing}
          onCancel={() => setEditorOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
