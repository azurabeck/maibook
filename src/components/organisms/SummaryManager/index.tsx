import { useMemo, useRef, useState } from 'react'
import { AlignLeft, List, Pencil, Sparkles, Trash2, X } from 'lucide-react'
import { updateSummary } from '@/services/firestore/projects'
import { useProjectStore } from '@/store/useProjectStore'
import type { BookSummary, SummaryLeaderStyle, SummaryNumbering, SummaryTextAlign, SummaryTextStyle } from '@/types'
import { BookSummaryView, buildSummaryEntries, resolveSummaryStyle } from '@/components/organisms/BookSummaryView/index'
import type { SummaryPart } from '@/components/organisms/BookSummaryView/index'
import { summaryManagerCss as css } from './css'

const PRESETS: Array<{ id: string; label: string; hint: string; config: BookSummary }> = [
  {
    id: 'parts',
    label: 'Com partes',
    hint: 'Partes centralizadas + capítulos numerados',
    config: {
      title: 'Sumário',
      fontFamily: 'Georgia, serif',
      leaderStyle: 'dots',
      numbering: 'number',
      showPageNumbers: true,
      showSubchapters: true,
      highlightGroups: true,
      numberGroupedOnly: true,
      titleStyle: { fontFamily: "'Alegreya Sans', sans-serif", fontSize: 26, bold: true, italic: false, align: 'left', divider: true },
      groupStyle: { fontFamily: "'Alegreya Sans', sans-serif", fontSize: 13, bold: true, italic: true, align: 'center', divider: true },
      entryStyle: { fontFamily: 'Georgia, serif', fontSize: 11, bold: false, italic: false },
      titleSpacingTop: 0,
      titleSpacingBottom: 26,
      groupSpacingTop: 18,
      groupSpacingBottom: 10,
      entrySpacing: 8,
    },
  },
  {
    id: 'two-columns',
    label: 'Duas colunas',
    hint: 'Lista em 2 colunas, partes em destaque',
    config: {
      title: 'Sumário',
      fontFamily: 'Georgia, serif',
      leaderStyle: 'dots',
      numbering: 'number',
      showPageNumbers: true,
      showSubchapters: true,
      highlightGroups: true,
      numberGroupedOnly: true,
      columns: 2,
      columnGap: 22,
      titleStyle: { fontFamily: "'Cinzel', serif", fontSize: 22, bold: true, italic: false, align: 'center', divider: false },
      groupStyle: { fontSize: 11, bold: true, italic: false, align: 'left', divider: true },
      entryStyle: { fontSize: 10, bold: false, italic: false },
      titleSpacingTop: 10,
      titleSpacingBottom: 26,
      groupSpacingTop: 12,
      groupSpacingBottom: 8,
      entrySpacing: 7,
    },
  },
  {
    id: 'classic',
    label: 'Clássico',
    hint: 'Pontilhado + número',
    config: { title: 'Sumário', fontFamily: 'Georgia, serif', leaderStyle: 'dots', numbering: 'none', showPageNumbers: true, showSubchapters: true },
  },
  {
    id: 'minimal',
    label: 'Minimalista',
    hint: 'Sem linha de ligação',
    config: { title: 'Sumário', fontFamily: 'Inter, sans-serif', leaderStyle: 'none', numbering: 'none', showPageNumbers: true, showSubchapters: true },
  },
  {
    id: 'numbered',
    label: 'Numerado',
    hint: 'Linha sólida + capítulos numerados',
    config: { title: 'Índice', fontFamily: 'Georgia, serif', leaderStyle: 'line', numbering: 'number', showPageNumbers: true, showSubchapters: false },
  },
  {
    id: 'modern',
    label: 'Contemporâneo',
    hint: 'Marcadores, sem número de página',
    config: { title: 'Conteúdo', fontFamily: 'Arial, sans-serif', leaderStyle: 'none', numbering: 'bullet', showPageNumbers: false, showSubchapters: true },
  },
]

const DEFAULT_SUMMARY: BookSummary = PRESETS.find((preset) => preset.id === 'classic')!.config

// Livro de exemplo pras miniaturas dos modelos prontos — com partes,
// pra dar pra ver como cada modelo trata os agrupamentos.
const SAMPLE_CHAPTERS = [
  { id: 's1', title: 'Prefácio', order: 0 },
  { id: 's2', title: 'Introdução', order: 1 },
  { id: 'p1', title: 'Parte um: O começo', order: 2 },
  { id: 'c1', title: 'A casa na colina', order: 0, parentId: 'p1' },
  { id: 'c2', title: 'O caderno azul', order: 1, parentId: 'p1' },
  { id: 'p2', title: 'Parte dois: A viagem', order: 3 },
  { id: 'c3', title: 'Estrada de terra', order: 0, parentId: 'p2' },
]

const FONT_OPTIONS = [
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: "'Times New Roman', serif", label: 'Times New Roman' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: "'Cinzel', serif", label: 'Cinzel' },
  { value: "'Alegreya Sans', sans-serif", label: 'Alegreya Sans' },
]

const LEADER_OPTIONS: { value: SummaryLeaderStyle; label: string }[] = [
  { value: 'dots', label: 'Pontilhado' },
  { value: 'line', label: 'Linha sólida' },
  { value: 'none', label: 'Nenhum' },
]

const NUMBERING_OPTIONS: { value: SummaryNumbering; label: string }[] = [
  { value: 'none', label: 'Sem numeração' },
  { value: 'number', label: '1, 2, 3...' },
  { value: 'bullet', label: 'Marcador (•)' },
]

const ALIGN_OPTIONS: { value: SummaryTextAlign; label: string }[] = [
  { value: 'left', label: 'Esquerda' },
  { value: 'center', label: 'Centro' },
  { value: 'right', label: 'Direita' },
]

type StyleKey = 'titleStyle' | 'groupStyle' | 'entryStyle'
type SpacingKey = 'titleSpacingTop' | 'titleSpacingBottom' | 'groupSpacingTop' | 'groupSpacingBottom' | 'entrySpacing'

// Cada trecho do sumário e o que dá pra ajustar nele: estilo do texto,
// alinhamento/linha (título e agrupamento) e os espaçamentos em volta.
const PARTS: { part: SummaryPart; styleKey: StyleKey; label: string; withLayout: boolean; spacing: { key: SpacingKey; label: string }[] }[] = [
  {
    part: 'title',
    styleKey: 'titleStyle',
    label: 'Título do sumário',
    withLayout: true,
    spacing: [{ key: 'titleSpacingTop', label: 'Espaço acima (px)' }, { key: 'titleSpacingBottom', label: 'Espaço abaixo (px)' }],
  },
  {
    part: 'group',
    styleKey: 'groupStyle',
    label: 'Título do agrupamento',
    withLayout: true,
    spacing: [{ key: 'groupSpacingTop', label: 'Espaço antes (px)' }, { key: 'groupSpacingBottom', label: 'Espaço depois (px)' }],
  },
  {
    part: 'entry',
    styleKey: 'entryStyle',
    label: 'Texto do capítulo',
    withLayout: false,
    spacing: [{ key: 'entrySpacing', label: 'Espaço entre capítulos (px)' }],
  },
]

// Sumários salvos antes de existir presetId: reconhece o modelo pelas
// opções básicas, como era feito antes.
function isPresetInUse(summary: BookSummary | undefined, preset: (typeof PRESETS)[number]) {
  if (!summary) return false
  if (summary.presetId) return summary.presetId === preset.id
  const config = preset.config
  return !config.highlightGroups
    && summary.title === config.title
    && summary.fontFamily === config.fontFamily
    && summary.leaderStyle === config.leaderStyle
    && summary.numbering === config.numbering
    && summary.showPageNumbers === config.showPageNumbers
    && summary.showSubchapters === config.showSubchapters
}

function toNumber(value: string, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && value.trim() !== '' ? Math.max(0, parsed) : fallback
}

export function SummaryManager({ projectId }: { projectId: string }) {
  const summary = useProjectStore((state) => state.currentProject?.summary)
  const chapters = useProjectStore((state) => state.chapters)
  const sections = useProjectStore((state) => state.currentProject?.sections)

  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<BookSummary>(DEFAULT_SUMMARY)
  const [saving, setSaving] = useState(false)
  const [applyingPresetId, setApplyingPresetId] = useState<string | null>(null)
  const [activePart, setActivePart] = useState<SummaryPart | null>(null)
  const partRefs = useRef<Partial<Record<SummaryPart, HTMLDivElement | null>>>({})

  const currentEntries = useMemo(() => buildSummaryEntries(chapters, summary ?? DEFAULT_SUMMARY, undefined, sections), [chapters, summary, sections])
  const draftEntries = useMemo(() => buildSummaryEntries(chapters.length ? chapters : SAMPLE_CHAPTERS, draft, undefined, chapters.length ? sections : undefined), [chapters, draft, sections])
  const draftStyle = resolveSummaryStyle(draft)

  // Aplica o modelo pronto como sumário do livro (mantém os textos
  // antes/depois que já existiam).
  async function applyPreset(presetId: string, config: BookSummary) {
    setApplyingPresetId(presetId)
    try {
      await updateSummary(projectId, { ...config, presetId, textBefore: summary?.textBefore, textAfter: summary?.textAfter })
    } catch (error) {
      console.error('Falha ao aplicar modelo de sumário:', error)
      window.alert('Não foi possível aplicar o modelo. Tente novamente.')
    } finally {
      setApplyingPresetId(null)
    }
  }

  // Abre o editor com o sumário atual — ou, pela canetinha de um
  // modelo pronto, com aquele modelo (mantendo os textos antes/depois).
  function openBuilder(start?: BookSummary) {
    setDraft(start
      ? { ...start, textBefore: summary?.textBefore, textAfter: summary?.textAfter }
      : summary ? { ...summary } : { ...DEFAULT_SUMMARY })
    setActivePart(null)
    setModalOpen(true)
  }

  // Clique num trecho da prévia: leva até os controles dele
  function editPart(part: SummaryPart) {
    setActivePart(part)
    partRefs.current[part]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  function setPartStyle(key: StyleKey, patch: Partial<SummaryTextStyle>) {
    setDraft((current) => ({ ...current, [key]: { ...current[key], ...patch } }))
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      // montado à mão: deixa de ser um dos modelos prontos
      await updateSummary(projectId, { ...draft, presetId: undefined })
      setModalOpen(false)
    } catch (error) {
      console.error('Falha ao salvar sumário:', error)
      window.alert('Não foi possível salvar o sumário. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    const confirmed = window.confirm('Remover o sumário do livro?')
    if (!confirmed) return
    await updateSummary(projectId, null)
  }

  // Controles de um trecho do sumário: fonte, tamanho, negrito/itálico,
  // alinhamento e linha abaixo (título e agrupamento) e espaçamentos.
  function renderPart({ part, styleKey, label, withLayout, spacing }: (typeof PARTS)[number]) {
    const own = draft[styleKey]
    const resolved = draftStyle[part]
    return (
      <div
        key={part}
        ref={(element) => { partRefs.current[part] = element }}
        className={activePart === part ? css.partActive : css.part}
        onFocusCapture={() => setActivePart(part)}
      >
        <p className={css.partLabel}><Pencil size={12} /> {label}</p>
        <div className={css.partRow}>
          <label className={css.field}>
            Fonte
            <select value={own?.fontFamily ?? ''} onChange={(event) => setPartStyle(styleKey, { fontFamily: event.target.value || undefined })}>
              <option value="">Mesma da fonte base</option>
              {FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className={css.field}>
            Tamanho (px)
            <input
              type="number"
              min={6}
              max={60}
              value={resolved.fontSize}
              onChange={(event) => setPartStyle(styleKey, { fontSize: toNumber(event.target.value, resolved.fontSize) })}
            />
          </label>
        </div>
        <div className={css.toggles}>
          <button type="button" className={resolved.bold ? css.optionActive : css.option} onClick={() => setPartStyle(styleKey, { bold: !resolved.bold })}>Negrito</button>
          <button type="button" className={resolved.italic ? css.optionActive : css.option} onClick={() => setPartStyle(styleKey, { italic: !resolved.italic })}>Itálico</button>
          {withLayout && ALIGN_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={resolved.align === option.value ? css.optionActive : css.option}
              onClick={() => setPartStyle(styleKey, { align: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
        {withLayout && (
          <div className={css.toggles}>
            <button type="button" className={resolved.divider ? css.optionActive : css.option} onClick={() => setPartStyle(styleKey, { divider: true })}>Com linha abaixo</button>
            <button type="button" className={!resolved.divider ? css.optionActive : css.option} onClick={() => setPartStyle(styleKey, { divider: false })}>Sem linha</button>
          </div>
        )}
        <div className={css.spacingGrid}>
          {spacing.map((field) => (
            <label key={field.key} className={css.field}>
              {field.label}
              <input
                type="number"
                min={0}
                max={200}
                value={draftStyle[field.key]}
                onChange={(event) => setDraft({ ...draft, [field.key]: toNumber(event.target.value, draftStyle[field.key]) })}
              />
            </label>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={css.root}>
      <div className={css.intro}>
        <div>
          <p className={css.tag}><List size={14} /> Navegação do livro</p>
          <h2 className={css.title}>Sumário</h2>
          <p className={css.description}>
            A lista de capítulos é sempre gerada automaticamente, na ordem e hierarquia que você já
            montou na lista lateral. Aqui você escolhe só o modelo visual — um dos prontos abaixo, ou
            "Montar meu sumário" pra escolher fonte, tamanho e espaçamento de cada parte, numeração e
            texto antes/depois da lista.
          </p>
        </div>
        <button className={css.build} type="button" onClick={() => openBuilder()}>
          <Sparkles size={16} /> Montar meu sumário
        </button>
      </div>

      <div>
        <p className={css.sectionLabel}>Modelos prontos</p>
        <div className={css.presets}>
          {PRESETS.map((preset) => {
            const active = isPresetInUse(summary, preset)
            const applying = applyingPresetId === preset.id

            return (
              <div key={preset.id} className={css.presetWrap}>
                <button
                  type="button"
                  className={active ? css.presetCardActive : css.presetCard}
                  disabled={applyingPresetId !== null}
                  onClick={() => void applyPreset(preset.id, preset.config)}
                  title="Usar este modelo"
                >
                  <div className={css.presetPreview}>
                    <BookSummaryView summary={preset.config} entries={buildSummaryEntries(SAMPLE_CHAPTERS, preset.config)} />
                  </div>
                  <div className={css.presetBody}>
                    <strong>{preset.label}{active ? ' · em uso' : ''}</strong>
                    <span>{applying ? 'Aplicando...' : preset.hint}</span>
                  </div>
                </button>
                <button
                  type="button"
                  className={css.presetEdit}
                  title="Editar este modelo (fonte, tamanho, espaçamento, linhas...)"
                  aria-label={`Editar o modelo ${preset.label}`}
                  onClick={() => openBuilder(preset.config)}
                >
                  <Pencil size={13} />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {summary && (
        <div className={css.current}>
          <div className={css.previewCol}>
            <p className={css.previewLabel}>Prévia do sumário</p>
            <div className={css.pagePreview}>
              <BookSummaryView summary={summary} entries={currentEntries} />
            </div>
          </div>
          <div className={css.meta}>
            <p><AlignLeft size={13} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Modelo atual: <strong>{PRESETS.find((preset) => isPresetInUse(summary, preset))?.label ?? 'Personalizado'}</strong>
              {summary.textBefore || summary.textAfter ? ' · com texto extra' : ''}
            </p>
            <p className={css.hint}>
              Os números de página mostrados aqui são só ilustrativos — os números reais aparecem em
              "Visualizar livro", calculados pela paginação de verdade.
            </p>
            <p className={css.hint}>
              Agrupamentos são os capítulos que têm outros capítulos dentro (ex.: "Parte um") — arraste
              um capítulo pra cima de outro na lista lateral pra agrupar.
            </p>
            <button className={css.editCurrent} type="button" onClick={() => openBuilder()}>
              <Pencil size={14} /> Editar sumário
            </button>
            <button className={css.remove} type="button" onClick={() => void handleRemove()}>
              <Trash2 size={14} /> Remover sumário
            </button>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={css.overlay} onMouseDown={() => setModalOpen(false)}>
          <div className={css.editor} onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.header}>
              <div>
                <p className={css.eyebrow}>Montar meu sumário</p>
                <h2>Modelo do sumário</h2>
                <p>A lista de capítulos continua automática — aqui você só define o estilo.</p>
              </div>
              <button className={css.close} type="button" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.content}>
              <div className={css.controls}>
                <section className={css.section}>
                  <h3>1. Título e textos</h3>
                  <label className={css.field}>
                    Título da página
                    <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Sumário" />
                  </label>
                  <label className={css.field}>
                    Texto antes da lista (opcional)
                    <textarea rows={2} value={draft.textBefore || ''} onChange={(event) => setDraft({ ...draft, textBefore: event.target.value })} placeholder="Ex.: uma frase de abertura, dedicatória curta..." />
                  </label>
                  <label className={css.field}>
                    Texto depois da lista (opcional)
                    <textarea rows={2} value={draft.textAfter || ''} onChange={(event) => setDraft({ ...draft, textAfter: event.target.value })} placeholder="Ex.: um agradecimento, nota do autor..." />
                  </label>
                </section>

                <section className={css.section}>
                  <h3>2. Cada trecho do sumário</h3>
                  <p className={css.sectionHint}>Dica: clique num trecho na prévia ao lado pra ir direto aos controles dele.</p>
                  <label className={css.field}>
                    Fonte base (usada nos trechos sem fonte própria)
                    <select value={draft.fontFamily} onChange={(event) => setDraft({ ...draft, fontFamily: event.target.value })}>
                      {FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                  {PARTS.map(renderPart)}
                </section>

                <section className={css.section}>
                  <h3>3. Colunas da lista</h3>
                  <div className={css.options}>
                    <button type="button" className={draft.columns !== 2 ? css.optionActive : css.option} onClick={() => setDraft({ ...draft, columns: 1 })}>1 coluna</button>
                    <button type="button" className={draft.columns === 2 ? css.optionActive : css.option} onClick={() => setDraft({ ...draft, columns: 2 })}>2 colunas</button>
                  </div>
                  {draft.columns === 2 && (
                    <label className={css.field}>
                      Espaço entre as colunas (px)
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={draftStyle.columnGap}
                        onChange={(event) => setDraft({ ...draft, columnGap: toNumber(event.target.value, draftStyle.columnGap) })}
                      />
                    </label>
                  )}
                </section>

                <section className={css.section}>
                  <h3>4. Ligação entre título e número</h3>
                  <div className={css.options}>
                    {LEADER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={draft.leaderStyle === option.value ? css.optionActive : css.option}
                        onClick={() => setDraft({ ...draft, leaderStyle: option.value })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className={css.section}>
                  <h3>5. Numeração dos capítulos</h3>
                  <div className={css.options}>
                    {NUMBERING_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={draft.numbering === option.value ? css.optionActive : css.option}
                        onClick={() => setDraft({ ...draft, numbering: option.value })}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </section>

                <section className={css.section}>
                  <h3>6. Exibição</h3>
                  <div className={css.toggles}>
                    <button
                      type="button"
                      className={draft.showPageNumbers ? css.optionActive : css.option}
                      onClick={() => setDraft({ ...draft, showPageNumbers: !draft.showPageNumbers })}
                    >
                      Mostrar número da página
                    </button>
                    <button
                      type="button"
                      className={draft.showSubchapters ? css.optionActive : css.option}
                      onClick={() => setDraft({ ...draft, showSubchapters: !draft.showSubchapters })}
                    >
                      Mostrar sub-capítulos
                    </button>
                    <button
                      type="button"
                      className={draft.highlightGroups ? css.optionActive : css.option}
                      onClick={() => setDraft({ ...draft, highlightGroups: !draft.highlightGroups })}
                    >
                      Destacar agrupamentos como títulos de seção
                    </button>
                    <button
                      type="button"
                      className={draft.numberGroupedOnly ? css.optionActive : css.option}
                      onClick={() => setDraft({ ...draft, numberGroupedOnly: !draft.numberGroupedOnly })}
                    >
                      Numerar só capítulos dentro de agrupamentos
                    </button>
                  </div>
                </section>
              </div>

              <div className={css.previewArea}>
                <p>Prévia</p>
                <div className={css.pagePreview}>
                  <BookSummaryView summary={draft} entries={draftEntries} onEditPart={editPart} activePart={activePart} />
                </div>
              </div>
            </div>

            <footer className={css.footer}>
              <button className={css.cancel} type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
              <button className={css.save} type="button" disabled={!draft.title.trim() || saving} onClick={() => void handleSaveDraft()}>
                {saving ? 'Salvando...' : 'Salvar sumário'}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
