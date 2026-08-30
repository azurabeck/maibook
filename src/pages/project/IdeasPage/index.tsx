import { useEffect, useRef, useState } from 'react'
import { Bot, Clock3, Lightbulb, Pencil, Send, Sparkles, Trash2, User, X } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { subscribeToCharacters } from '@/services/firestore/characters'
import { appendIdeaDiscussionMessage, createIdea, deleteIdea, subscribeToIdeas, updateIdea } from '@/services/firestore/ideas'
import { useProjectStore } from '@/store/useProjectStore'
import type { Character, Idea, IdeaDiscussionMessage, IdeaKind, IdeaMoment } from '@/types'
import { ideasPageCss as css } from './css'
import { IDEA_KIND_TABS, IDEA_MOMENT_LABELS, IDEA_MOMENT_OPTIONS } from './type'

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

export function IdeasPage() {
  const projectId = useProjectStore((state) => state.currentProject?.id)
  const projectTitle = useProjectStore((state) => state.currentProject?.title ?? 'este livro')
  const chapters = useProjectStore((state) => state.chapters)

  const [characters, setCharacters] = useState<Character[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [activeKind, setActiveKind] = useState<IdeaKind>('story')

  const [draftContent, setDraftContent] = useState('')
  const [draftCharacterName, setDraftCharacterName] = useState('')
  const [draftMoment, setDraftMoment] = useState<IdeaMoment>('start')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editCharacterName, setEditCharacterName] = useState('')
  const [editMoment, setEditMoment] = useState<IdeaMoment>('start')
  const [savingEditId, setSavingEditId] = useState<string | null>(null)

  const [discussingIdeaId, setDiscussingIdeaId] = useState<string | null>(null)
  const [pendingMessages, setPendingMessages] = useState<IdeaDiscussionMessage[]>([])
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const discussionContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!projectId) return
    return subscribeToCharacters(projectId, setCharacters)
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    return subscribeToIdeas(projectId, setIdeas)
  }, [projectId])

  const visibleIdeas = ideas.filter((idea) => idea.kind === activeKind)

  // sempre a versão mais atual da ideia em discussão (o histórico
  // salvo chega via subscribeToIdeas, então lemos direto da lista)
  const discussingIdea = ideas.find((idea) => idea.id === discussingIdeaId) ?? null
  const conversation = [...(discussingIdea?.discussion ?? []), ...pendingMessages]

  // assim que uma mensagem otimista aparece confirmada no histórico
  // salvo, ela some da lista "pendente" pra não duplicar na tela
  useEffect(() => {
    if (!discussingIdea) return
    setPendingMessages((current) =>
      current.filter((pending) => !discussingIdea.discussion?.some((saved) => saved.createdAt === pending.createdAt)),
    )
  }, [discussingIdea])

  useEffect(() => {
    if (!discussionContentRef.current) return
    discussionContentRef.current.scrollTop = discussionContentRef.current.scrollHeight
  }, [conversation.length, aiLoading])

  const handleCreateIdea = async () => {
    if (!projectId || !draftContent.trim()) return
    setCreating(true)
    try {
      await createIdea(projectId, {
        kind: activeKind,
        content: draftContent,
        characterName: activeKind === 'character' ? draftCharacterName : undefined,
        moment: activeKind === 'story' ? draftMoment : undefined,
      })
      setDraftContent('')
      setDraftCharacterName('')
      setDraftMoment('start')
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (idea: Idea) => {
    setEditingId(idea.id)
    setEditContent(idea.content)
    setEditCharacterName(idea.characterName ?? '')
    setEditMoment(idea.moment ?? 'start')
  }

  const commitEdit = async (idea: Idea) => {
    if (!projectId || !editContent.trim()) return
    setSavingEditId(idea.id)
    try {
      await updateIdea(projectId, idea.id, {
        content: editContent,
        characterName: idea.kind === 'character' ? editCharacterName : undefined,
        moment: idea.kind === 'story' ? editMoment : undefined,
      })
      setEditingId(null)
    } finally {
      setSavingEditId(null)
    }
  }

  const handleDeleteIdea = async (idea: Idea) => {
    if (!projectId) return
    const confirmed = window.confirm('Excluir esta ideia? Essa ação não pode ser desfeita.')
    if (!confirmed) return
    await deleteIdea(projectId, idea.id)
  }

  const openDiscussion = (idea: Idea) => {
    setDiscussingIdeaId(idea.id)
    setPendingMessages([])
    setAiQuestion('')
    setAiError('')
  }

  const handleAskAboutIdea = async () => {
    if (!projectId || !discussingIdea || !aiQuestion.trim()) return
    const question = aiQuestion.trim()
    setAiLoading(true)
    setAiError('')
    try {
      const answer = await aiProvider.discussIdea({
        question,
        bookTitle: projectTitle,
        idea: {
          kind: discussingIdea.kind,
          content: discussingIdea.content,
          characterName: discussingIdea.characterName,
          momentLabel: discussingIdea.moment ? IDEA_MOMENT_LABELS[discussingIdea.moment] : undefined,
        },
        chapters: chapters
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((chapter) => ({ title: chapter.title, content: htmlToText(chapter.content) })),
        characters: characters.map((character) => ({ name: character.name, aliases: character.aliases ?? [] })),
      })

      const message: IdeaDiscussionMessage = { question, answer, createdAt: Date.now() }
      // mostra a resposta na hora (otimista) e já registra no
      // histórico da ideia pra poder consultar depois
      setPendingMessages((current) => [...current, message])
      setAiQuestion('')
      appendIdeaDiscussionMessage(projectId, discussingIdea.id, message).catch((error) =>
        console.error('Falha ao salvar conversa da ideia:', error),
      )
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'Não consegui falar com a IA agora.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className={css.page}>
      <header className={css.pageHeader}>
        <div>
          <p className={css.eyebrow}>Bloco de notas</p>
          <h1>Ideias</h1>
          <p>Anote insights sobre a história ou sobre personagens específicos e converse com a IA para amadurecer cada ideia antes de escrever.</p>
        </div>
      </header>

      <nav className={css.tabs} aria-label="Tipo de nota">
        {IDEA_KIND_TABS.map((tab) => (
          <button
            className={activeKind === tab.value ? css.tabActive : css.tab}
            key={tab.value}
            type="button"
            onClick={() => setActiveKind(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={css.panel}>
        <div className={css.composer}>
          <textarea
            value={draftContent}
            onChange={(event) => setDraftContent(event.target.value)}
            placeholder={activeKind === 'character'
              ? 'Escreva uma ideia sobre um personagem...'
              : 'Escreva uma ideia sobre a história...'}
          />
          <div className={css.composerMeta}>
            {activeKind === 'character' ? (
              <>
                <input
                  className={css.composerField}
                  value={draftCharacterName}
                  onChange={(event) => setDraftCharacterName(event.target.value)}
                  placeholder="Nome do personagem"
                  list="ideas-page-character-names"
                />
                <datalist id="ideas-page-character-names">
                  {characters.map((character) => <option value={character.name} key={character.id} />)}
                </datalist>
              </>
            ) : (
              <select
                className={css.composerField}
                value={draftMoment}
                onChange={(event) => setDraftMoment(event.target.value as IdeaMoment)}
              >
                {IDEA_MOMENT_OPTIONS.map((option) => (
                  <option value={option.value} key={option.value}>{option.label}</option>
                ))}
              </select>
            )}
            <button
              className={css.composerSubmit}
              type="button"
              disabled={creating || !draftContent.trim()}
              onClick={() => void handleCreateIdea()}
            >
              <Lightbulb size={15} /> {creating ? 'Salvando...' : 'Salvar ideia'}
            </button>
          </div>
        </div>

        <div className={css.feed}>
          {visibleIdeas.length === 0 ? (
            <div className={css.empty}>
              <span><Lightbulb size={24} /></span>
              <h3>Nenhuma ideia registrada ainda</h3>
              <p>
                {activeKind === 'character'
                  ? 'Anote insights sobre um personagem e associe o nome dele à ideia.'
                  : 'Anote insights sobre a história e marque em que momento do livro ela se encaixa.'}
              </p>
            </div>
          ) : visibleIdeas.map((idea) => (
            <article className={css.card} key={idea.id}>
              {editingId === idea.id ? (
                <div className={css.edit}>
                  <textarea value={editContent} onChange={(event) => setEditContent(event.target.value)} autoFocus />
                  <div className={css.editMeta}>
                    {idea.kind === 'character' ? (
                      <input
                        className={css.composerField}
                        value={editCharacterName}
                        onChange={(event) => setEditCharacterName(event.target.value)}
                        placeholder="Nome do personagem"
                        list="ideas-page-character-names"
                      />
                    ) : (
                      <select
                        className={css.composerField}
                        value={editMoment}
                        onChange={(event) => setEditMoment(event.target.value as IdeaMoment)}
                      >
                        {IDEA_MOMENT_OPTIONS.map((option) => (
                          <option value={option.value} key={option.value}>{option.label}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className={css.editActions}>
                    <button className={css.editCancel} type="button" onClick={() => setEditingId(null)}>Cancelar</button>
                    <button
                      className={css.editSave}
                      type="button"
                      disabled={savingEditId === idea.id || !editContent.trim()}
                      onClick={() => void commitEdit(idea)}
                    >
                      {savingEditId === idea.id ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <header className={css.cardHeader}>
                    <span className={css.tag}>
                      {idea.kind === 'character'
                        ? (idea.characterName || 'Sem personagem definido')
                        : IDEA_MOMENT_LABELS[idea.moment ?? 'start']}
                    </span>
                    <span className={css.date}><Clock3 size={12} /> {new Date(idea.createdAt).toLocaleDateString('pt-BR')}</span>
                  </header>
                  <p className={css.content}>{idea.content}</p>
                  <footer className={css.cardFooter}>
                    <button className={css.actionAi} type="button" onClick={() => openDiscussion(idea)}>
                      <Sparkles size={13} /> Conversar com a IA
                    </button>
                    <button className={css.action} type="button" onClick={() => startEdit(idea)}>
                      <Pencil size={13} /> Editar
                    </button>
                    <button className={css.actionDanger} type="button" onClick={() => void handleDeleteIdea(idea)}>
                      <Trash2 size={13} />
                    </button>
                  </footer>
                </>
              )}
            </article>
          ))}
        </div>
      </section>

      {discussingIdea && (
        <div className={css.discussionOverlay} onMouseDown={() => !aiLoading && setDiscussingIdeaId(null)}>
          <section className={css.discussionModal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.discussionHeader}>
              <div>
                <p className={css.eyebrow}>Copiloto de ideias</p>
                <h2>Conversar sobre esta ideia</h2>
                <blockquote>{discussingIdea.content}</blockquote>
              </div>
              <button type="button" onClick={() => setDiscussingIdeaId(null)}><X size={18} /></button>
            </header>

            <div className={css.discussionContent} ref={discussionContentRef}>
              {conversation.length === 0 && !aiLoading && (
                <div className={css.discussionPlaceholder}>
                  <span><Bot size={17} /></span>
                  <p>Pergunte, por exemplo, se essa ideia combina com o tom do livro, como ela pode se conectar com outros capítulos, ou peça sugestões de desdobramento. Toda conversa fica registrada aqui para você consultar depois.</p>
                </div>
              )}

              {conversation.map((message, index) => (
                <div className={css.discussionExchange} key={`${message.createdAt}-${index}`}>
                  <div className={css.discussionBubbleUser}><User size={12} /> {message.question}</div>
                  <div className={css.discussionBubbleAi}>
                    <strong><Bot size={12} /> IA</strong>
                    <p>{message.answer}</p>
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className={css.discussionLoading}>
                  <span className={css.discussionSpinner} /> A IA está pensando...
                </div>
              )}

              {aiError && <p className={css.discussionError}>{aiError}</p>}
            </div>

            <footer className={css.discussionFooter}>
              <input
                value={aiQuestion}
                onChange={(event) => setAiQuestion(event.target.value)}
                placeholder={aiLoading ? 'Consultando o livro...' : 'O que você quer perguntar sobre essa ideia?'}
                disabled={aiLoading}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void handleAskAboutIdea()
                }}
              />
              <button type="button" onClick={() => void handleAskAboutIdea()} disabled={aiLoading || !aiQuestion.trim()} aria-label="Enviar pergunta">
                {aiLoading ? <span className={css.discussionSpinnerOnSolid} /> : <Send size={16} />}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
