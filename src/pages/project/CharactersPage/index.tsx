import { useEffect, useMemo, useState } from 'react'
import {
  Bot,
  ChevronRight,
  Clock3,
  FileSearch,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { aiProvider } from '@/services/ai'
import {
  createCharacter,
  deleteCharacter,
  subscribeToCharacters,
  updateCharacterAliases,
  updateCharacterDetails,
  updateCharacterConnections,
  updateCharacterChapterSummary,
} from '@/services/firestore/characters'
import { useProjectStore } from '@/store/useProjectStore'
import type { Character, CharacterDetailsAnalysis } from '@/types'
import { charactersPageCss as css } from './css'
import type { CharacterPageSection } from './type'

const detailCards: Array<{
  key: keyof Pick<CharacterDetailsAnalysis, 'physicalCharacteristics' | 'personality' | 'age' | 'mainPlot' | 'motivation'>
  label: string
  eyebrow: string
}> = [
  { key: 'physicalCharacteristics', label: 'Características físicas', eyebrow: 'Aparência' },
  { key: 'personality', label: 'Personalidade', eyebrow: 'Comportamento' },
  { key: 'age', label: 'Idade', eyebrow: 'Linha da vida' },
  { key: 'mainPlot', label: 'Enredo principal', eyebrow: 'Papel na história' },
  { key: 'motivation', label: 'Motivação', eyebrow: 'Força motriz' },
]

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function CharactersPage() {
  const projectId = useProjectStore((state) => state.currentProject?.id)
  const chapters = useProjectStore((state) => state.chapters)
  const [activeSection, setActiveSection] = useState<CharacterPageSection>('Detalhes do personagem')
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeCharacterId, setActiveCharacterId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [newCharacterName, setNewCharacterName] = useState('')
  const [creating, setCreating] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysisKind, setAnalysisKind] = useState<'details' | 'connections' | 'summary'>('details')
  const [analysisScope, setAnalysisScope] = useState<'all' | 'chapter'>('all')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [aliasDraft, setAliasDraft] = useState('')
  const [savingAliases, setSavingAliases] = useState(false)

  useEffect(() => {
    if (!projectId) return
    return subscribeToCharacters(projectId, (items) => {
      setCharacters(items)
      setActiveCharacterId((current) => {
        if (current && items.some((item) => item.id === current)) return current
        return items[0]?.id ?? null
      })
    })
  }, [projectId])

  useEffect(() => {
    if (!selectedChapterId && chapters.length) setSelectedChapterId(chapters[0].id)
  }, [chapters, selectedChapterId])

  const filteredCharacters = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
    if (!normalizedSearch) return characters
    return characters.filter((character) => {
      const searchableNames = [character.name, ...(character.aliases ?? [])]
      return searchableNames.some((name) => name.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
    })
  }, [characters, search])

  const activeCharacter = characters.find((character) => character.id === activeCharacterId) ?? null

  useEffect(() => {
    setAliasDraft(activeCharacter?.aliases?.join(', ') ?? '')
  }, [activeCharacter?.id, activeCharacter?.aliases])

  const handleCreateCharacter = async () => {
    if (!projectId || !newCharacterName.trim()) return
    setCreating(true)
    try {
      const characterId = await createCharacter(projectId, newCharacterName)
      setActiveCharacterId(characterId)
      setNewCharacterName('')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteCharacter = async () => {
    if (!projectId || !activeCharacter) return
    const confirmed = window.confirm(`Excluir ${activeCharacter.name}?`)
    if (!confirmed) return
    await deleteCharacter(projectId, activeCharacter.id)
  }

  const handleSaveAliases = async () => {
    if (!projectId || !activeCharacter) return
    const aliases = Array.from(new Set(
      aliasDraft
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter((item) => item && item.toLocaleLowerCase('pt-BR') !== activeCharacter.name.toLocaleLowerCase('pt-BR')),
    ))
    setSavingAliases(true)
    try {
      await updateCharacterAliases(projectId, activeCharacter.id, aliases)
    } finally {
      setSavingAliases(false)
    }
  }

  const openAnalysis = (kind: 'details' | 'connections' | 'summary' = 'details') => {
    setAnalysisKind(kind)
    setAnalysisError('')
    setAnalysisScope('all')
    setSelectedChapterId(chapters[0]?.id ?? '')
    setAnalysisOpen(true)
  }

  const handleAnalyze = async () => {
    if (!projectId || !activeCharacter) return

    const selectedChapters = analysisScope === 'all'
      ? chapters
      : chapters.filter((chapter) => chapter.id === selectedChapterId)

    const chaptersWithContent = selectedChapters
      .map((chapter) => ({ id: chapter.id, title: chapter.title, content: htmlToText(chapter.content) }))
      .filter((chapter) => chapter.content.length > 0)

    if (!chaptersWithContent.length) {
      setAnalysisError('O recorte selecionado não possui texto para analisar.')
      return
    }

    setAnalyzing(true)
    setAnalysisError('')
    try {
      const input = {
        characterName: activeCharacter.name,
        characterAliases: activeCharacter.aliases ?? [],
        chapters: chaptersWithContent,
        scope: analysisScope,
      }
      if (analysisKind === 'connections') {
        const result = await aiProvider.analyzeCharacterConnections(input)
        await updateCharacterConnections(projectId, activeCharacter.id, { ...result, analyzedAt: Date.now() })
      } else if (analysisKind === 'summary') {
        const result = await aiProvider.analyzeCharacterChapterSummary(input)
        await updateCharacterChapterSummary(projectId, activeCharacter.id, { ...result, analyzedAt: Date.now() })
      } else {
        const result = await aiProvider.analyzeCharacterDetails(input)
        await updateCharacterDetails(projectId, activeCharacter.id, { ...result, analyzedAt: Date.now() })
      }
      setAnalysisOpen(false)
    } catch (error) {
      setAnalysisError(error instanceof Error ? error.message : 'Não foi possível concluir a análise.')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className={css.page}>
      <header className={css.pageHeader}>
        <div>
          <p className={css.eyebrow}>Elenco do livro</p>
          <h1>Personagens</h1>
          <p>Organize informações extraídas do manuscrito e acompanhe a evolução de cada personagem.</p>
        </div>
      </header>

      <nav className={css.tabs} aria-label="Áreas dos personagens">
        {(['Detalhes do personagem', 'Conexões', 'Resumo por capítulo'] as CharacterPageSection[]).map((section) => (
          <button
            className={activeSection === section ? css.tabActive : css.tab}
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
          >
            {section}
          </button>
        ))}
      </nav>

      <div className={css.workspace}>
        <aside className={css.sidebar}>
          <div className={css.sidebarHeader}>
            <div>
              <strong>Personagens</strong>
              <span>{characters.length} cadastrado{characters.length === 1 ? '' : 's'}</span>
            </div>
          </div>

          <label className={css.search}>
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar personagem" />
          </label>

          <div className={css.characterList}>
            {filteredCharacters.map((character) => (
              <button
                className={activeCharacterId === character.id ? css.characterActive : css.character}
                key={character.id}
                type="button"
                onClick={() => setActiveCharacterId(character.id)}
              >
                <span className={css.avatar}>{initials(character.name)}</span>
                <span className={css.characterInfo}>
                  <strong>{character.name}</strong>
                  <small>{character.detailsAnalysis ? 'Análise disponível' : 'Aguardando análise'}</small>
                </span>
                <ChevronRight size={15} />
              </button>
            ))}
          </div>

          <div className={css.createCharacter}>
            <input
              value={newCharacterName}
              onChange={(event) => setNewCharacterName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleCreateCharacter()
              }}
              placeholder="Nome do personagem"
            />
            <button type="button" disabled={!newCharacterName.trim() || creating} onClick={() => void handleCreateCharacter()}>
              <Plus size={16} />
            </button>
          </div>
        </aside>

        <main className={css.content}>
          {activeSection === 'Conexões' && activeCharacter ? (
            <section className="character-ai-section">
              <header className="character-ai-section__header"><div><p className={css.eyebrow}>Mapa relacional</p><h2>Conexões de {activeCharacter.name}</h2><p>Família, amigos, inimigos, conhecidos e evolução das relações ao longo do livro.</p></div><button className={css.analyzeButton} onClick={() => openAnalysis('connections')}><Sparkles size={16}/>{activeCharacter.connectionsAnalysis ? 'Atualizar conexões com IA' : 'Gerar conexões com IA'}</button></header>
              {activeCharacter.connectionsAnalysis ? <><div className="connection-groups">{(['family','friend','enemy','acquaintance'] as const).map(type => { const items=activeCharacter.connectionsAnalysis?.connections.filter(item=>item.relationshipType===type)??[]; if(!items.length)return null; return <section className="connection-group" key={type}><h3>{type==='family'?'Árvore genealógica':type==='friend'?'Amigos':type==='enemy'?'Inimigos':'Conhecidos'} <span>{items.length}</span></h3><div className="connection-cards">{items.map((item,index)=><article key={`${item.characterName}-${index}`}><strong>{item.characterName}</strong><small>{item.relationshipLabel}</small>{item.firstMeetingChapterTitle&&<p><b>Primeiro encontro:</b> {item.firstMeetingChapterTitle}</p>}<p>{item.firstMeetingContext}</p>{item.currentContext&&<p className="connection-current">{item.currentContext}</p>}</article>)}</div></section> })}</div><section className="connection-timeline"><h3>Timeline de conexões</h3>{activeCharacter.connectionsAnalysis.timeline.map((event,index)=><article key={`${event.chapterId}-${index}`}><span></span><div><small>{event.chapterTitle}</small><strong>{event.connectedCharacters.join(' · ')}</strong><p>{event.summary}</p></div></article>)}</section></> : <div className={css.emptyAnalysis}><span><UsersRound size={30}/></span><h3>Mapeie as relações do personagem</h3><p>A IA identifica parentesco, amizades, rivalidades, conhecidos e quando cada conexão surgiu.</p><button onClick={()=>openAnalysis('connections')}><Sparkles size={16}/> Gerar conexões com IA</button></div>}
            </section>
          ) : activeSection === 'Resumo por capítulo' && activeCharacter ? (
            <section className="character-ai-section">
              <header className="character-ai-section__header"><div><p className={css.eyebrow}>Presença narrativa</p><h2>Resumo por capítulo</h2><p>Acompanhe somente os capítulos em que {activeCharacter.name} realmente aparece.</p></div><button className={css.analyzeButton} onClick={() => openAnalysis('summary')}><Sparkles size={16}/>{activeCharacter.chapterSummaryAnalysis ? 'Atualizar resumos com IA' : 'Gerar resumos com IA'}</button></header>
              {activeCharacter.chapterSummaryAnalysis?.chapters.length ? <div className="chapter-summary-list">{activeCharacter.chapterSummaryAnalysis.chapters.map((item,index)=><article key={`${item.chapterId}-${index}`}><div className="chapter-summary-index">{String(index+1).padStart(2,'0')}</div><div><small>{item.chapterTitle}</small><p>{item.summary}</p>{item.keyActions.length>0&&<div className="chapter-summary-actions">{item.keyActions.map(action=><span key={action}>{action}</span>)}</div>}{item.characterState&&<blockquote>{item.characterState}</blockquote>}</div></article>)}</div> : <div className={css.emptyAnalysis}><span><FileSearch size={30}/></span><h3>Crie a trajetória capítulo a capítulo</h3><p>A IA resume a participação do personagem apenas onde ele aparece, incluindo ações e estado narrativo.</p><button onClick={()=>openAnalysis('summary')}><Sparkles size={16}/> Gerar resumos com IA</button></div>}
            </section>
          ) : activeSection !== 'Detalhes do personagem' ? (
            <div className={css.comingSoon}><strong>Selecione um personagem</strong></div>
          ) : activeCharacter ? (
            <>
              <header className={css.characterHeader}>
                <div className={css.characterIdentity}>
                  <span className={css.largeAvatar}>{initials(activeCharacter.name)}</span>
                  <div>
                    <p className={css.eyebrow}>Dossiê do personagem</p>
                    <h2>{activeCharacter.name}</h2>
                    <span className={css.analysisStatus}>
                      <Clock3 size={13} />
                      {activeCharacter.detailsAnalysis
                        ? `Analisado em ${new Date(activeCharacter.detailsAnalysis.analyzedAt).toLocaleDateString('pt-BR')}`
                        : 'Nenhuma análise realizada'}
                    </span>
                  </div>
                </div>
                <div className={css.headerActions}>
                  <button className={css.deleteButton} type="button" onClick={() => void handleDeleteCharacter()} title="Excluir personagem">
                    <Trash2 size={16} />
                  </button>
                  <button className={css.analyzeButton} type="button" onClick={() => openAnalysis('details')} disabled={!chapters.length}>
                    <Sparkles size={16} />
                    {activeCharacter.detailsAnalysis ? 'Atualizar detalhes com IA' : 'Gerar detalhes com IA'}
                  </button>
                </div>
              </header>

              <section className={css.aliasPanel}>
                <div className={css.aliasIntro}>
                  <span><Tag size={17} /></span>
                  <div>
                    <strong>Nomes alternativos e fases</strong>
                    <p>Informe apelidos, títulos, nomes antigos ou identidades usadas pelo mesmo personagem. Separe por vírgula.</p>
                  </div>
                </div>
                <div className={css.aliasEditor}>
                  <input
                    value={aliasDraft}
                    onChange={(event) => setAliasDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void handleSaveAliases()
                    }}
                    placeholder={`Ex.: ${activeCharacter.name} criança, apelido, título, identidade secreta`}
                  />
                  <button type="button" disabled={savingAliases} onClick={() => void handleSaveAliases()}>
                    {savingAliases ? 'Salvando...' : 'Salvar nomes'}
                  </button>
                </div>
                {(activeCharacter.aliases?.length ?? 0) > 0 && (
                  <div className={css.aliasTags}>
                    {activeCharacter.aliases?.map((alias) => <span key={alias}>{alias}</span>)}
                  </div>
                )}
              </section>

              {activeCharacter.detailsAnalysis ? (
                <div className={css.detailGrid}>
                  {detailCards.map((card) => (
                    <article className={card.key === 'mainPlot' || card.key === 'motivation' ? css.detailCardWide : css.detailCard} key={card.key}>
                      <p>{card.eyebrow}</p>
                      <h3>{card.label}</h3>
                      <div>{activeCharacter.detailsAnalysis?.[card.key]}</div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={css.emptyAnalysis}>
                  <span><Bot size={30} /></span>
                  <h3>Transforme o manuscrito em um dossiê</h3>
                  <p>A IA pode localizar descrições, comportamentos, idade, papel no enredo e motivações de {activeCharacter.name}.</p>
                  <button type="button" onClick={() => openAnalysis('details')} disabled={!chapters.length}>
                    <Sparkles size={16} /> Gerar detalhes com IA
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={css.emptyCharacter}>
              <UserRound size={30} />
              <h3>Crie seu primeiro personagem</h3>
              <p>Cadastre somente o nome. A IA preencherá os detalhes a partir dos capítulos.</p>
            </div>
          )}
        </main>
      </div>

      {analysisOpen && activeCharacter && (
        <div className={css.overlay} onMouseDown={() => !analyzing && setAnalysisOpen(false)}>
          <section className={css.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.modalHeader}>
              <div>
                <p className={css.eyebrow}>Análise literária com IA</p>
                <h2>{analysisKind === 'connections' ? 'Analisar conexões de ' : analysisKind === 'summary' ? 'Resumir participação de ' : 'Gerar detalhes de '}{activeCharacter.name}</h2>
                <p>Escolha quanto do manuscrito deve ser usado e confira os nomes associados ao personagem.</p>
              </div>
              <button type="button" disabled={analyzing} onClick={() => setAnalysisOpen(false)}><X size={18} /></button>
            </header>

            <div className={css.modalContent}>
              <div className={css.scopeGrid}>
                <button className={analysisScope === 'all' ? css.scopeActive : css.scope} type="button" onClick={() => setAnalysisScope('all')}>
                  <span><Sparkles size={18} /></span>
                  <strong>Analisar tudo</strong>
                  <small>Usa todos os capítulos com conteúdo para montar um perfil mais completo.</small>
                </button>
                <button className={analysisScope === 'chapter' ? css.scopeActive : css.scope} type="button" onClick={() => setAnalysisScope('chapter')}>
                  <span><FileSearch size={18} /></span>
                  <strong>Analisar capítulo</strong>
                  <small>Gera os detalhes com base apenas em um capítulo selecionado.</small>
                </button>
              </div>

              {analysisScope === 'chapter' && (
                <label className={css.chapterField}>
                  Capítulo usado na análise
                  <select value={selectedChapterId} onChange={(event) => setSelectedChapterId(event.target.value)}>
                    {chapters.map((chapter) => <option value={chapter.id} key={chapter.id}>{chapter.title}</option>)}
                  </select>
                </label>
              )}

              <div className={css.analysisIncludes}>
                <strong>Identidade considerada pela IA</strong>
                <span>{[activeCharacter.name, ...(activeCharacter.aliases ?? [])].join(' · ')}</span>
              </div>

              <div className={css.analysisIncludes}>
                <strong>{analysisKind === 'connections' ? 'A análise mapeará' : analysisKind === 'summary' ? 'A análise resumirá' : 'A análise preencherá'}</strong>
                <span>Características físicas · Personalidade · Idade e fases · Enredo principal · Motivação</span>
              </div>

              {analysisError && <p className={css.error}>{analysisError}</p>}
            </div>

            <footer className={css.modalFooter}>
              <button className={css.cancelButton} type="button" disabled={analyzing} onClick={() => setAnalysisOpen(false)}>Cancelar</button>
              <button className={css.runButton} type="button" disabled={analyzing || (analysisScope === 'chapter' && !selectedChapterId)} onClick={() => void handleAnalyze()}>
                <Sparkles size={16} />
                {analyzing ? 'Analisando manuscrito...' : 'Gerar detalhes com IA'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
