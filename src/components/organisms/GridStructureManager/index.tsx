import { useEffect, useMemo, useState } from 'react'
import { Columns2, FileText, LayoutGrid, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import {
  createGridStructure,
  deleteGridStructure,
  subscribeToGridStructures,
  updateGridStructure,
} from '@/services/firestore/gridStructures'
import type { GridStructure, GridStructureDraft, PageFormat } from '@/types'
import { gridStructureManagerCss as css } from './css'
import type { GridStructureEditorProps, GridStructureManagerProps } from './type'

const pageFormats: Array<{ id: PageFormat; name: string; size: string; width: number; height: number }> = [
  { id: 'a4', name: 'A4', size: '210 × 297 mm', width: 210, height: 297 },
  { id: 'a5', name: 'A5', size: '148 × 210 mm', width: 148, height: 210 },
  { id: 'a6', name: 'A6', size: '105 × 148 mm', width: 105, height: 148 },
  { id: 'trade', name: 'Trade', size: '152 × 229 mm', width: 152, height: 229 },
  { id: 'royal', name: 'Royal', size: '156 × 234 mm', width: 156, height: 234 },
  { id: 'demi', name: 'Demi', size: '138 × 216 mm', width: 138, height: 216 },
]

const defaultDraft: GridStructureDraft = {
  name: '',
  pageFormat: 'a5',
  orientation: 'portrait',
  columns: 1,
  marginTop: 18,
  marginRight: 16,
  marginBottom: 20,
  marginLeft: 16,
  columnGap: 8,
  fontFamily: 'Georgia, serif',
  fontSize: 11,
  lineHeight: 1.55,
  paragraphSpacing: 8,
  firstLineIndent: 8,
  textAlignment: 'justify',
  hyphenation: true,
  widowsAndOrphans: true,
}

function GridPreview({ structure, compact = false }: { structure: GridStructureDraft; compact?: boolean }) {
  const format = pageFormats.find((item) => item.id === structure.pageFormat) ?? pageFormats[1]
  const portrait = structure.orientation === 'portrait'
  const pageWidth = portrait ? format.width : format.height
  const pageHeight = portrait ? format.height : format.width
  const scale = compact ? Math.min(130 / pageWidth, 158 / pageHeight) : Math.min(430 / pageWidth, 570 / pageHeight)

  return (
    <div
      className={css.paper}
      style={{
        width: pageWidth * scale,
        height: pageHeight * scale,
        padding: `${structure.marginTop * scale}px ${structure.marginRight * scale}px ${structure.marginBottom * scale}px ${structure.marginLeft * scale}px`,
      }}
    >
      <div
        className={css.paperContent}
        style={{
          columnCount: structure.columns,
          columnGap: structure.columnGap * scale,
          fontFamily: structure.fontFamily,
          fontSize: compact ? 4.5 : Math.max(7, structure.fontSize * 0.72),
          lineHeight: structure.lineHeight,
          textAlign: structure.textAlignment,
          hyphens: structure.hyphenation ? 'auto' : 'none',
        }}
      >
        <p style={{ margin: `0 0 ${structure.paragraphSpacing * scale}px`, textIndent: structure.firstLineIndent * scale }}>
          A luz atravessava a janela quando o primeiro capítulo começou. Cada palavra ocupava seu lugar na página, com ritmo, respiro e proporção.
        </p>
        <p style={{ margin: `0 0 ${structure.paragraphSpacing * scale}px`, textIndent: structure.firstLineIndent * scale }}>
          Este modelo define somente a área de conteúdo do livro. Cabeçalhos e rodapés permanecem independentes para que a composição seja reutilizável.
        </p>
        <p style={{ margin: 0, textIndent: structure.firstLineIndent * scale }}>
          Margens, colunas, fonte e espaçamento são exibidos em tempo real para aproximar a prévia do resultado editorial final.
        </p>
      </div>
    </div>
  )
}

function NumberField({ label, value, min, max, step = 1, suffix, onChange }: {
  label: string; value: number; min: number; max: number; step?: number; suffix?: string; onChange: (value: number) => void
}) {
  return (
    <label className={css.field}>
      <span className={css.fieldLabel}>{label}</span>
      <div className={css.inputWrap}>
        <input className={css.input} type="number" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
        {suffix && <span className={css.suffix}>{suffix}</span>}
      </div>
    </label>
  )
}

function GridStructureEditor({ initialValue, onCancel, onSave }: GridStructureEditorProps) {
  const [form, setForm] = useState<GridStructureDraft>(() => ({ ...defaultDraft, ...(initialValue ?? {}) }))
  const [saving, setSaving] = useState(false)
  const setField = <Key extends keyof GridStructureDraft>(field: Key, value: GridStructureDraft[Key]) => setForm((current) => ({ ...current, [field]: value }))

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try { await onSave({ ...form, name: form.name.trim() }) } finally { setSaving(false) }
  }

  return (
    <div className={css.overlay} onMouseDown={onCancel}>
      <div className={css.editor} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <header className={css.editorHeader}>
          <div><p className={css.eyebrow}>Estrutura de página</p><h2 className={css.editorTitle}>{initialValue ? 'Editar grid' : 'Criar grid'}</h2><p className={css.editorSubtitle}>Configure a mancha gráfica usada no conteúdo dos capítulos.</p></div>
          <button className={css.close} type="button" onClick={onCancel}><X size={18} /></button>
        </header>
        <div className={css.editorContent}>
          <div className={css.controls}>
            <section className={css.section}>
              <h3 className={css.sectionTitle}>1. Identificação e página</h3>
              <label className={css.field}><span className={css.fieldLabel}>Nome do modelo</span><input className={css.input} autoFocus value={form.name} placeholder="Ex.: Miolo romance A5" onChange={(event) => setField('name', event.target.value)} /></label>
              <div className={css.formatGrid}>{pageFormats.map((format) => <button key={format.id} className={form.pageFormat === format.id ? css.formatActive : css.format} type="button" onClick={() => setField('pageFormat', format.id)}><FileText size={18} /><strong>{format.name}</strong><span>{format.size}</span></button>)}</div>
              <div className={css.segmented}><button type="button" className={form.orientation === 'portrait' ? css.segmentActive : css.segment} onClick={() => setField('orientation', 'portrait')}>Retrato</button><button type="button" className={form.orientation === 'landscape' ? css.segmentActive : css.segment} onClick={() => setField('orientation', 'landscape')}>Paisagem</button></div>
            </section>
            <section className={css.section}>
              <h3 className={css.sectionTitle}>2. Mancha gráfica</h3>
              <div className={css.columnsChoice}><button type="button" className={form.columns === 1 ? css.choiceActive : css.choice} onClick={() => setField('columns', 1)}><FileText size={18} />Uma coluna</button><button type="button" className={form.columns === 2 ? css.choiceActive : css.choice} onClick={() => setField('columns', 2)}><Columns2 size={18} />Duas colunas</button></div>
              <div className={css.fieldGrid}><NumberField label="Superior" value={form.marginTop} min={5} max={60} suffix="mm" onChange={(value) => setField('marginTop', value)} /><NumberField label="Direita" value={form.marginRight} min={5} max={60} suffix="mm" onChange={(value) => setField('marginRight', value)} /><NumberField label="Inferior" value={form.marginBottom} min={5} max={60} suffix="mm" onChange={(value) => setField('marginBottom', value)} /><NumberField label="Esquerda" value={form.marginLeft} min={5} max={60} suffix="mm" onChange={(value) => setField('marginLeft', value)} /></div>
              {form.columns === 2 && <NumberField label="Espaço entre colunas" value={form.columnGap} min={3} max={30} suffix="mm" onChange={(value) => setField('columnGap', value)} />}
            </section>
            <section className={css.section}>
              <h3 className={css.sectionTitle}>3. Tipografia</h3>
              <label className={css.field}><span className={css.fieldLabel}>Fonte do conteúdo</span><select className={css.select} value={form.fontFamily} onChange={(event) => setField('fontFamily', event.target.value)}><option value="Georgia, serif">Georgia</option><option value="'Times New Roman', serif">Times New Roman</option><option value="'Palatino Linotype', serif">Palatino</option><option value="Inter, sans-serif">Inter</option><option value="Arial, sans-serif">Arial</option></select></label>
              <div className={css.fieldGrid}><NumberField label="Tamanho" value={form.fontSize} min={8} max={18} suffix="pt" onChange={(value) => setField('fontSize', value)} /><NumberField label="Entrelinha" value={form.lineHeight} min={1} max={2.4} step={0.05} onChange={(value) => setField('lineHeight', value)} /><NumberField label="Após parágrafo" value={form.paragraphSpacing} min={0} max={24} suffix="pt" onChange={(value) => setField('paragraphSpacing', value)} /><NumberField label="Recuo inicial" value={form.firstLineIndent} min={0} max={24} suffix="mm" onChange={(value) => setField('firstLineIndent', value)} /></div>
              <div className={css.segmented}><button type="button" className={form.textAlignment === 'justify' ? css.segmentActive : css.segment} onClick={() => setField('textAlignment', 'justify')}>Justificado</button><button type="button" className={form.textAlignment === 'left' ? css.segmentActive : css.segment} onClick={() => setField('textAlignment', 'left')}>À esquerda</button></div>
              <div className={css.toggles}><button type="button" className={form.hyphenation ? css.toggleActive : css.toggle} onClick={() => setField('hyphenation', !form.hyphenation)}>Hifenização</button><button type="button" className={form.widowsAndOrphans ? css.toggleActive : css.toggle} onClick={() => setField('widowsAndOrphans', !form.widowsAndOrphans)}>Viúvas e órfãs</button></div>
            </section>
          </div>
          <div className={css.previewArea}><p className={css.previewLabel}>Prévia do conteúdo</p><div className={css.previewStage}><GridPreview structure={form} /></div><div className={css.previewMeta}><span>{pageFormats.find((item) => item.id === form.pageFormat)?.name}</span><span>{form.columns} coluna{form.columns > 1 ? 's' : ''}</span><span>{form.fontSize} pt</span></div></div>
        </div>
        <footer className={css.footer}><button className={css.secondaryButton} type="button" onClick={onCancel}>Cancelar</button><button className={css.primaryButton} type="button" disabled={!form.name.trim() || saving} onClick={save}><Save size={15} />{saving ? 'Salvando...' : 'Salvar grid'}</button></footer>
      </div>
    </div>
  )
}

export function GridStructureManager({ projectId }: GridStructureManagerProps) {
  const [structures, setStructures] = useState<GridStructure[]>([])
  const [editing, setEditing] = useState<GridStructure | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => subscribeToGridStructures(projectId, (items) => { setStructures(items); setLoading(false) }), [projectId])
  const emptyText = useMemo(() => loading ? 'Carregando modelos...' : 'Crie o primeiro grid para definir o miolo do livro.', [loading])

  const handleSave = async (draft: GridStructureDraft) => {
    setError('')
    try {
      if (editing) await updateGridStructure(projectId, editing.id, draft)
      else await createGridStructure(projectId, draft)
      setEditorOpen(false); setEditing(null)
    } catch (saveError) { console.error(saveError); setError('Não foi possível salvar o grid.'); throw saveError }
  }

  const handleDelete = async (structure: GridStructure) => {
    if (!window.confirm(`Excluir o grid “${structure.name}”?`)) return
    try { await deleteGridStructure(projectId, structure.id) } catch (deleteError) { console.error(deleteError); setError('Não foi possível excluir o grid.') }
  }

  return <div className={css.root}>
    <div className={css.intro}><div><p className={css.introTag}><LayoutGrid size={14} />Formatação editorial</p><h2 className={css.title}>Grid das páginas</h2><p className={css.description}>Crie modelos para a área de conteúdo do livro, sem interferir no cabeçalho ou rodapé.</p></div><button className={css.add} type="button" onClick={() => { setEditing(null); setEditorOpen(true) }}><Plus size={23} /></button></div>
    {error && <p className={css.error}>{error}</p>}
    {structures.length ? <div className={css.cards}>{structures.map((structure) => <article className={css.card} key={structure.id}><div className={css.cardPreview}><GridPreview compact structure={structure} /></div><div className={css.cardBody}><div><h3>{structure.name}</h3><p>{pageFormats.find((item) => item.id === structure.pageFormat)?.name} · {structure.columns} coluna{structure.columns > 1 ? 's' : ''} · {structure.fontSize} pt</p></div><div className={css.cardActions}><button type="button" onClick={() => { setEditing(structure); setEditorOpen(true) }}><Pencil size={15} /></button><button type="button" onClick={() => handleDelete(structure)}><Trash2 size={15} /></button></div></div></article>)}</div> : <div className={css.empty}><LayoutGrid size={25} /><h3>{loading ? 'Buscando grids' : 'Nenhum grid criado'}</h3><p>{emptyText}</p></div>}
    {editorOpen && <GridStructureEditor initialValue={editing} onCancel={() => setEditorOpen(false)} onSave={handleSave} />}
  </div>
}
