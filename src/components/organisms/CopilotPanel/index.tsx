import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Bot, ChevronRight, ImageIcon, Lightbulb, Save, Send, UserRound } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { subscribeToCharacters } from '@/services/firestore/characters'
import { useProjectStore } from '@/store/useProjectStore'
import type { Character } from '@/types'
import { copilotPanelCss as css } from './css'

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function CopilotPanel() {
  const [tab, setTab] = useState<'copiloto' | 'notas'>('copiloto')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [characters, setCharacters] = useState<Character[]>([])
  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  const currentProject = useProjectStore((state) => state.currentProject)
  const chapters = useProjectStore((state) => state.chapters)
  const activeChapter = useProjectStore((state) =>
    state.chapters.find((chapter) => chapter.id === state.activeChapterId),
  )
  const updateChapterNotes = useProjectStore((state) => state.updateChapterNotes)

  useEffect(() => {
    if (!currentProject?.id) return
    return subscribeToCharacters(currentProject.id, setCharacters)
  }, [currentProject?.id])

  useEffect(() => {
    setNotesDraft(activeChapter?.notes ?? '')
  }, [activeChapter?.id, activeChapter?.notes])

  const insights = useMemo(() => {
    const items: Array<{ icon: typeof AlertTriangle; tone: 'warn' | 'info' | 'danger'; text: string }> = []
    const emptyChapters = chapters.filter((chapter) => !htmlToText(chapter.content))
    const withoutDetails = characters.filter((character) => !character.detailsAnalysis)
    const withoutImage = characters.filter((character) => !character.imageUrl)
    const withoutAliases = characters.filter((character) => !(character.aliases?.length))

    if (emptyChapters.length) {
      items.push({ icon: AlertTriangle, tone: 'warn', text: `${emptyChapters.length} capítulo${emptyChapters.length === 1 ? '' : 's'} ainda sem conteúdo.` })
    }
    if (withoutDetails.length) {
      items.push({ icon: UserRound, tone: 'info', text: `${withoutDetails.length} personagem${withoutDetails.length === 1 ? '' : 's'} aguardando análise da IA.` })
    }
    if (withoutImage.length) {
      items.push({ icon: ImageIcon, tone: 'info', text: `${withoutImage.length} personagem${withoutImage.length === 1 ? '' : 's'} sem imagem.` })
    }
    if (characters.length && withoutAliases.length === characters.length) {
      items.push({ icon: Lightbulb, tone: 'info', text: 'Nenhum personagem possui nomes alternativos cadastrados.' })
    }
    if (!items.length) {
      items.push({ icon: Lightbulb, tone: 'info', text: 'Tudo organizado por enquanto. Continue escrevendo!' })
    }
    return items.slice(0, 4)
  }, [chapters, characters])

  async function handleAsk() {
    if (!question.trim() || !currentProject) return
    setLoading(true)
    setAnswer('')
    try {
      const response = await aiProvider.answerBookQuestion({
        question: question.trim(),
        bookTitle: currentProject.title,
        activeChapter: activeChapter
          ? { title: activeChapter.title, content: htmlToText(activeChapter.content) }
          : undefined,
        chapters: chapters
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((chapter) => ({ title: chapter.title, content: htmlToText(chapter.content) })),
        characters: characters.map((character) => ({
          name: character.name,
          aliases: character.aliases ?? [],
          details: character.detailsAnalysis
            ? [
                character.detailsAnalysis.physicalCharacteristics,
                character.detailsAnalysis.personality,
                character.detailsAnalysis.age,
                character.detailsAnalysis.mainPlot,
                character.detailsAnalysis.motivation,
              ].join(' ')
            : undefined,
        })),
      })
      setAnswer(response)
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Não consegui falar com a IA agora.')
    } finally {
      setLoading(false)
    }
  }

  async function saveNotes() {
    if (!activeChapter) return
    setSavingNotes(true)
    try {
      await updateChapterNotes(activeChapter.id, notesDraft)
    } finally {
      setSavingNotes(false)
    }
  }

  return (
    <aside className={`${css.panel} ${css.copilotPanel}`}>
      <div className={css.copilotPanelTabs}>
        <button className={tab === 'copiloto' ? css.copilotTabActive : css.copilotTab} onClick={() => setTab('copiloto')}>IA Copiloto</button>
        <button className={tab === 'notas' ? css.copilotTabActive : css.copilotTab} onClick={() => setTab('notas')}>Notas</button>
      </div>

      {tab === 'copiloto' ? (
        <>
          <div className={css.copilotPanelIntro}>
            <span className={css.copilotPanelAvatar}><Bot size={19} /></span>
            <p>Olá! Posso responder perguntas sobre o capítulo atual, o manuscrito e os personagens analisados.</p>
          </div>

          <div className={css.copilotPanelInsightsLabel}>Insights do seu livro</div>
          <ul className={css.copilotPanelInsights}>
            {insights.map((insight, index) => (
              <li key={`${insight.text}-${index}`} className={css.insightByTone[insight.tone]}>
                <insight.icon size={15} />
                <span>{insight.text}</span>
                <ChevronRight size={14} className={css.insightArrow} />
              </li>
            ))}
          </ul>

          {answer && <div className={css.copilotPanelAnswer}>{answer}</div>}

          <div className={css.copilotPanelAsk}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={loading ? 'Consultando o livro...' : 'Pergunte algo...'}
              disabled={loading}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleAsk()
              }}
            />
            <button onClick={() => void handleAsk()} disabled={loading || !question.trim()} aria-label="Enviar pergunta">
              <Send size={16} />
            </button>
          </div>
        </>
      ) : (
        <div className={css.notes}>
          <div className={css.notesHeader}>
            <div>
              <strong>{activeChapter?.title ?? 'Nenhum capítulo selecionado'}</strong>
              <span>Anotações privadas deste capítulo</span>
            </div>
          </div>
          <textarea
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            disabled={!activeChapter}
            placeholder="Registre ideias, correções, lembretes ou decisões para este capítulo..."
          />
          <button type="button" onClick={() => void saveNotes()} disabled={!activeChapter || savingNotes}>
            <Save size={15} /> {savingNotes ? 'Salvando...' : 'Salvar notas'}
          </button>
        </div>
      )}
    </aside>
  )
}
