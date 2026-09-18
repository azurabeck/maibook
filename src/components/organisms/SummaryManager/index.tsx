import { useMemo, useState } from 'react'
import { AlignLeft, List, Sparkles, Trash2, X } from 'lucide-react'
import { updateSummary } from '@/services/firestore/projects'
import { useProjectStore } from '@/store/useProjectStore'
import { chapterDepth, sortChaptersForReading } from '@/utils/chapterTree'
import type { BookSummary, SummaryLeaderStyle, SummaryNumbering } from '@/types'
import { BookSummaryView } from '@/components/organisms/BookSummaryView/index'
import type { SummaryEntry } from '@/components/organisms/BookSummaryView/index'
import { summaryManagerCss as css } from './css'

const PRESETS: Array<{ id: string; label: string; hint: string; config: BookSummary }> = [
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

const DEFAULT_SUMMARY: BookSummary = PRESETS[0].config

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

function buildEntries(chapters: { id: string; title: string; parentId?: string; order: number }[], summary: BookSummary): SummaryEntry[] {
  const ordered = sortChaptersForReading(chapters)
  return ordered
    .filter((chapter) => summary.showSubchapters || !chapter.parentId)
    .map((chapter, index) => ({
      id: chapter.id,
      title: chapter.title,
      depth: summary.showSubchapters ? chapterDepth(chapter, chapters) : 0,
      pageNumber: index + 1,
    }))
}

export function SummaryManager({ projectId }: { projectId: string }) {
  const summary = useProjectStore((state) => state.currentProject?.summary)
  const chapters = useProjectStore((state) => state.chapters)

  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState<BookSummary>(DEFAULT_SUMMARY)
  const [saving, setSaving] = useState(false)

  const currentEntries = useMemo(() => buildEntries(chapters, summary ?? DEFAULT_SUMMARY), [chapters, summary])
  const draftEntries = useMemo(() => buildEntries(chapters, draft), [chapters, draft])

  async function applyPreset(config: BookSummary) {
    await updateSummary(projectId, { ...config, textBefore: summary?.textBefore, textAfter: summary?.textAfter })
  }

  function openBuilder() {
    setDraft(summary ? { ...summary } : { ...DEFAULT_SUMMARY })
    setModalOpen(true)
  }

  async function handleSaveDraft() {
    setSaving(true)
    try {
      await updateSummary(projectId, draft)
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove() {
    const confirmed = window.confirm('Remover o sumário do livro?')
    if (!confirmed) return
    await updateSummary(projectId, null)
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
            "Montar meu sumário" pra escolher fonte, numeração e texto antes/depois da lista.
          </p>
        </div>
        <button className={css.build} type="button" onClick={openBuilder}>
          <Sparkles size={16} /> Montar meu sumário
        </button>
      </div>

      <div>
        <p className={css.sectionLabel}>Modelos prontos</p>
        <div className={css.presets}>
          {PRESETS.map((preset) => {
            const active = summary?.title === preset.config.title
              && summary?.fontFamily === preset.config.fontFamily
              && summary?.leaderStyle === preset.config.leaderStyle
              && summary?.numbering === preset.config.numbering
              && summary?.showPageNumbers === preset.config.showPageNumbers
              && summary?.showSubchapters === preset.config.showSubchapters

            return (
              <button
                key={preset.id}
                type="button"
                className={active ? css.presetCardActive : css.presetCard}
                onClick={() => void applyPreset(preset.config)}
              >
                <div className={css.presetPreview}>
                  <BookSummaryView summary={preset.config} entries={buildEntries(chapters, preset.config).slice(0, 5)} />
                </div>
                <div className={css.presetBody}>
                  <strong>{preset.label}</strong>
                  <span>{preset.hint}</span>
                </div>
              </button>
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
              Modelo atual: <strong>{summary.title}</strong>{summary.textBefore || summary.textAfter ? ' · com texto extra' : ''}
            </p>
            <p className={css.hint}>
              Os números de página mostrados aqui são só ilustrativos — os números reais aparecem em
              "Visualizar livro", calculados pela paginação de verdade.
            </p>
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
                  <h3>2. Fonte</h3>
                  <label className={css.field}>
                    Fonte do sumário
                    <select value={draft.fontFamily} onChange={(event) => setDraft({ ...draft, fontFamily: event.target.value })}>
                      {FONT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  </label>
                </section>

                <section className={css.section}>
                  <h3>3. Ligação entre título e número</h3>
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
                  <h3>4. Numeração dos capítulos</h3>
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
                  <h3>5. Exibição</h3>
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
                      Mostrar sub-capítulos recuados
                    </button>
                  </div>
                </section>
              </div>

              <div className={css.previewArea}>
                <p>Prévia</p>
                <div className={css.pagePreview}>
                  <BookSummaryView summary={draft} entries={draftEntries} />
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
