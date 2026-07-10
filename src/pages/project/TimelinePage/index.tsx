import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, CalendarRange, Clock3, Sparkles, X } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { updateChapterOrderAnalysis, updateStoryTimelineAnalysis } from '@/services/firestore/projects'
import { useProjectStore } from '@/store/useProjectStore'
import { timelinePageCss as css } from './css'
import type { Chapter } from '@/types'

type TimelineSection = 'Timeline dos capítulos' | 'Timeline da história'
type AnalysisKind = 'chapters' | 'story'

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

function chapterPayload(chapters: Chapter[]) {
  return chapters
    .map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      order: chapter.order,
      content: htmlToText(chapter.content),
    }))
    .filter((chapter) => chapter.content.length > 0)
}

export function TimelinePage() {
  const project = useProjectStore((state) => state.currentProject)
  const chapters = useProjectStore((state) => state.chapters)
  const [activeSection, setActiveSection] = useState<TimelineSection>('Timeline dos capítulos')
  const [analysisKind, setAnalysisKind] = useState<AnalysisKind | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const orderedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.order - b.order),
    [chapters],
  )

  const runAnalysis = async () => {
    if (!project || !analysisKind) return
    const input = { chapters: chapterPayload(orderedChapters) }

    if (!input.chapters.length) {
      setError('Nenhum capítulo com conteúdo foi encontrado para análise.')
      return
    }

    setAnalyzing(true)
    setError('')
    try {
      if (analysisKind === 'chapters') {
        const result = await aiProvider.analyzeChapterOrder(input)
        await updateChapterOrderAnalysis(project.id, { ...result, analyzedAt: Date.now() })
      } else {
        const result = await aiProvider.analyzeStoryTimeline(input)
        await updateStoryTimelineAnalysis(project.id, { ...result, analyzedAt: Date.now() })
      }
      setAnalysisKind(null)
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Não foi possível concluir a análise.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className={css.page}>
      <header className={css.pageHeader}>
        <div>
          <p className={css.eyebrow}>Continuidade narrativa</p>
          <h1>Timeline</h1>
          <p>Visualize a ordem atual do livro e use a IA para revisar capítulos e reconstruir a cronologia da história.</p>
        </div>
      </header>

      <nav className={css.tabs}>
        {(['Timeline dos capítulos', 'Timeline da história'] as TimelineSection[]).map((section) => (
          <button
            className={activeSection === section ? css.tabActive : css.tab}
            key={section}
            onClick={() => setActiveSection(section)}
            type="button"
          >
            {section}
          </button>
        ))}
      </nav>

      {activeSection === 'Timeline dos capítulos' ? (
        <section className={css.panel}>
          <header className={css.sectionHeader}>
            <div>
              <p className={css.eyebrow}>Estrutura atual</p>
              <h2>Sequência dos capítulos</h2>
              <p>A timeline abaixo acompanha exatamente a ordem configurada hoje no livro.</p>
            </div>
            <button className={css.aiButton} type="button" onClick={() => { setError(''); setAnalysisKind('chapters') }}>
              <Sparkles size={16} /> Analisar ordem com IA
            </button>
          </header>

          <div className={css.chapterTimeline}>
            {orderedChapters.map((chapter, index) => (
              <article className={css.chapterItem} key={chapter.id}>
                <div className={css.orderBadge}>{String(index + 1).padStart(2, '0')}</div>
                <div className={css.chapterCard}>
                  <small>Ordem atual {chapter.order}</small>
                  <h3>{chapter.title}</h3>
                  <p>{htmlToText(chapter.content).slice(0, 180) || 'Capítulo ainda sem conteúdo.'}{htmlToText(chapter.content).length > 180 ? '…' : ''}</p>
                </div>
                {index < orderedChapters.length - 1 && <ArrowRight className={css.arrow} size={15} />}
              </article>
            ))}
          </div>

          {project?.chapterOrderAnalysis && (
            <section className={css.analysisResult}>
              <header>
                <div>
                  <p className={css.eyebrow}>Sugestão editorial</p>
                  <h3>Ordem recomendada pela IA</h3>
                </div>
                <span><Clock3 size={13} /> {new Date(project.chapterOrderAnalysis.analyzedAt).toLocaleDateString('pt-BR')}</span>
              </header>
              <p className={css.overview}>{project.chapterOrderAnalysis.summary}</p>
              <div className={css.suggestionList}>
                {[...project.chapterOrderAnalysis.suggestions]
                  .sort((a, b) => a.suggestedOrder - b.suggestedOrder)
                  .map((item) => (
                    <article key={item.chapterId}>
                      <div className={css.suggestedOrder}>{String(item.suggestedOrder).padStart(2, '0')}</div>
                      <div>
                        <strong>{item.chapterTitle}</strong>
                        <small>Posição atual: {item.currentOrder}</small>
                        <p>{item.reason}</p>
                      </div>
                    </article>
                  ))}
              </div>
            </section>
          )}
        </section>
      ) : (
        <section className={css.panel}>
          <header className={css.sectionHeader}>
            <div>
              <p className={css.eyebrow}>Cronologia interna</p>
              <h2>Timeline da história</h2>
              <p>A IA organiza os principais eventos do manuscrito, usando o primeiro acontecimento como ano 0.</p>
            </div>
            <button className={css.aiButton} type="button" onClick={() => { setError(''); setAnalysisKind('story') }}>
              <Sparkles size={16} /> Gerar timeline com IA
            </button>
          </header>

          {project?.storyTimelineAnalysis ? (
            <>
              <section className={css.storyOverview}>
                <CalendarRange size={21} />
                <div>
                  <strong>Visão geral da história</strong>
                  <p>{project.storyTimelineAnalysis.overview}</p>
                </div>
              </section>

              <div className={css.storyTimeline}>
                {project.storyTimelineAnalysis.events.map((event, index) => (
                  <article key={`${event.year}-${event.title}-${index}`}>
                    <div className={css.yearColumn}>
                      <span>Ano</span>
                      <strong>{event.year}</strong>
                    </div>
                    <div className={css.timelineDot} />
                    <div className={css.eventCard}>
                      <small>{event.chapterTitles.join(' · ')}</small>
                      <h3>{event.title}</h3>
                      <p>{event.summary}</p>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className={css.empty}>
              <span><BookOpen size={30} /></span>
              <h3>Reconstrua a cronologia do livro</h3>
              <p>A IA analisará todos os capítulos, identificará os eventos principais e calculará os anos relativos a partir do ano 0.</p>
              <button type="button" onClick={() => setAnalysisKind('story')}><Sparkles size={16} /> Gerar timeline com IA</button>
            </div>
          )}
        </section>
      )}

      {analysisKind && (
        <div className={css.overlay} onMouseDown={() => !analyzing && setAnalysisKind(null)}>
          <section className={css.modal} onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.modalHeader}>
              <div>
                <p className={css.eyebrow}>Análise literária com IA</p>
                <h2>{analysisKind === 'chapters' ? 'Revisar ordem dos capítulos' : 'Gerar timeline da história'}</h2>
                <p>{analysisKind === 'chapters'
                  ? 'A IA avaliará ritmo, cronologia, revelações e continuidade, sem alterar os capítulos automaticamente.'
                  : 'Todos os capítulos serão analisados para construir uma cronologia relativa iniciada no ano 0.'}</p>
              </div>
              <button disabled={analyzing} onClick={() => setAnalysisKind(null)} type="button"><X size={18} /></button>
            </header>
            <div className={css.modalContent}>
              <div className={css.analysisInfo}>
                <strong>{orderedChapters.length} capítulos no livro</strong>
                <span>{chapterPayload(orderedChapters).length} possuem conteúdo e serão enviados para análise.</span>
              </div>
              {error && <p className={css.error}>{error}</p>}
            </div>
            <footer className={css.modalFooter}>
              <button className={css.cancel} disabled={analyzing} onClick={() => setAnalysisKind(null)} type="button">Cancelar</button>
              <button className={css.run} disabled={analyzing} onClick={() => void runAnalysis()} type="button">
                <Sparkles size={16} /> {analyzing ? 'Analisando manuscrito...' : 'Iniciar análise'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
