import { useEffect, useRef, useState } from 'react'
import { Bot, Save, Send, User } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { subscribeToCharacters } from '@/services/firestore/characters'
import { useProjectStore } from '@/store/useProjectStore'
import type { Character } from '@/types'
import { copilotPanelCss as css } from './css'

// quantas trocas anteriores mandamos de volta pra IA como contexto —
// o suficiente pra manter a continuidade sem inflar o prompt à toa
const MAX_HISTORY_TURNS = 6

interface CopilotMessage {
  question: string
  answer: string
  createdAt: number
}

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function CopilotPanel() {
  const [tab, setTab] = useState<'copiloto' | 'notas'>('copiloto')
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<CopilotMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [askError, setAskError] = useState('')
  const [characters, setCharacters] = useState<Character[]>([])
  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const conversationRef = useRef<HTMLDivElement>(null)

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

  // rola a conversa pro final sempre que uma mensagem nova chega ou
  // quando o indicador de "carregando" aparece
  useEffect(() => {
    if (!conversationRef.current) return
    conversationRef.current.scrollTop = conversationRef.current.scrollHeight
  }, [messages.length, loading])

  async function handleAsk() {
    if (!question.trim() || !currentProject) return
    const asked = question.trim()
    setLoading(true)
    setAskError('')
    try {
      const response = await aiProvider.answerBookQuestion({
        question: asked,
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
        // manda as últimas trocas pra IA continuar a conversa em vez
        // de responder cada pergunta isolada
        history: messages.slice(-MAX_HISTORY_TURNS).map((message) => ({ question: message.question, answer: message.answer })),
      })
      setMessages((current) => [...current, { question: asked, answer: response, createdAt: Date.now() }])
      setQuestion('')
    } catch (error) {
      setAskError(error instanceof Error ? error.message : 'Não consegui falar com a IA agora.')
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
          <div className={css.copilotConversation} ref={conversationRef}>
            {messages.length === 0 && (
              <div className={css.copilotPanelIntro}>
                <span className={css.copilotPanelAvatar}><Bot size={19} /></span>
                <p>Olá! Posso responder perguntas sobre o capítulo atual, o manuscrito e os personagens analisados.</p>
              </div>
            )}

            {messages.map((message, index) => (
              <div className={css.exchange} key={`${message.createdAt}-${index}`}>
                <div className={css.bubbleUser}><User size={12} /> {message.question}</div>
                <div className={css.bubbleAi}>
                  <strong><Bot size={12} /> IA</strong>
                  <p>{message.answer}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className={css.loadingBubble}>
                <span className={css.spinner} /> Consultando o livro...
              </div>
            )}

            {askError && <p className={css.askError}>{askError}</p>}
          </div>

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
              {loading ? <span className={css.spinnerOnSolid} /> : <Send size={16} />}
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
