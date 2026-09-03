import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Bot,
  Camera,
  ChevronRight,
  Clock3,
  Download,
  FileSearch,
  Map,
  MapPin,
  MapPinned,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import { aiProvider } from '@/services/ai'
import {
  createLocation,
  deleteLocation,
  subscribeToLocations,
  updateLocationAliases,
  updateLocationFullAnalysis,
  updateLocationImage,
} from '@/services/firestore/locations'
import { updateLocationDetectionAnalysis, updateWorldMapImage } from '@/services/firestore/projects'
import { uploadLocationImage, uploadWorldMapImage, validateImageFile } from '@/services/storage/images'
import { useProjectStore } from '@/store/useProjectStore'
import type { BookLocation, LocationDetailsAnalysis } from '@/types'
import { locationsPageCss as css } from './css'
import type { LocationPageSection } from './type'

const detailCards: Array<{
  key: keyof Pick<LocationDetailsAnalysis, 'physicalDescription' | 'atmosphere' | 'significance' | 'history'>
  label: string
  eyebrow: string
}> = [
  { key: 'physicalDescription', label: 'Descrição física', eyebrow: 'Aparência' },
  { key: 'atmosphere', label: 'Atmosfera', eyebrow: 'Clima emocional' },
  { key: 'significance', label: 'Importância na trama', eyebrow: 'Papel na história' },
  { key: 'history', label: 'História do lugar', eyebrow: 'Origem' },
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

export function LocationsPage() {
  const projectId = useProjectStore((state) => state.currentProject?.id)
  const persistedDetection = useProjectStore((state) => state.currentProject?.locationDetectionAnalysis)
  const worldMapImageUrl = useProjectStore((state) => state.currentProject?.worldMapImageUrl)
  const chapters = useProjectStore((state) => state.chapters)
  const [activeSection, setActiveSection] = useState<LocationPageSection>('Detalhes do lugar')
  const [locations, setLocations] = useState<BookLocation[]>([])
  const [activeLocationId, setActiveLocationId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [newLocationName, setNewLocationName] = useState('')
  const [creating, setCreating] = useState(false)
  const [analysisOpen, setAnalysisOpen] = useState(false)
  const [analysisScope, setAnalysisScope] = useState<'all' | 'chapter'>('all')
  const [selectedChapterId, setSelectedChapterId] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState('')
  const [aliasDraft, setAliasDraft] = useState('')
  const [savingAliases, setSavingAliases] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectedNames, setDetectedNames] = useState<string[]>([])
  const [detectError, setDetectError] = useState('')
  const [addingDetectedName, setAddingDetectedName] = useState<string | null>(null)
  const [detectedCollapsed, setDetectedCollapsed] = useState(false)
  const [uploadingWorldMap, setUploadingWorldMap] = useState(false)
  const [worldMapError, setWorldMapError] = useState('')
  const [uploadingLocationImageId, setUploadingLocationImageId] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    if (!projectId) return
    return subscribeToLocations(projectId, (items) => {
      setLocations(items)
      setActiveLocationId((current) => {
        if (current && items.some((item) => item.id === current)) return current
        return items[0]?.id ?? null
      })
    })
  }, [projectId])

  useEffect(() => {
    if (!selectedChapterId && chapters.length) setSelectedChapterId(chapters[0].id)
  }, [chapters, selectedChapterId])

  // carrega a última varredura salva no projeto, assim quem entra na
  // página já vê os lugares encontrados sem precisar clicar em
  // atualizar de novo
  useEffect(() => {
    setDetectedNames(persistedDetection?.names ?? [])
  }, [persistedDetection])

  const filteredLocations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR')
    if (!normalizedSearch) return locations
    return locations.filter((location) => {
      const searchableNames = [location.name, ...(location.aliases ?? [])]
      return searchableNames.some((name) => name.toLocaleLowerCase('pt-BR').includes(normalizedSearch))
    })
  }, [locations, search])

  // nomes (e apelidos) já cadastrados, normalizados — usado pra nunca
  // sugerir de novo um lugar que o autor já tem na lista
  const addedNames = useMemo(
    () => new Set(locations.flatMap((location) => [location.name, ...(location.aliases ?? [])]).map((name) => name.toLocaleLowerCase('pt-BR'))),
    [locations],
  )
  const pendingDetectedNames = detectedNames
    .filter((name) => !addedNames.has(name.toLocaleLowerCase('pt-BR')))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))

  const activeLocation = locations.find((location) => location.id === activeLocationId) ?? null

  useEffect(() => {
    setAliasDraft(activeLocation?.aliases?.join(', ') ?? '')
  }, [activeLocation?.id, activeLocation?.aliases])

  const handleCreateLocation = async () => {
    if (!projectId || !newLocationName.trim()) return
    setCreating(true)
    try {
      const locationId = await createLocation(projectId, newLocationName)
      setActiveLocationId(locationId)
      setNewLocationName('')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteLocation = async () => {
    if (!projectId || !activeLocation) return
    const confirmed = window.confirm(`Excluir ${activeLocation.name}?`)
    if (!confirmed) return
    await deleteLocation(projectId, activeLocation.id)
  }

  const handleSaveAliases = async () => {
    if (!projectId || !activeLocation) return
    const aliases = Array.from(new Set(
      aliasDraft
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter((item) => item && item.toLocaleLowerCase('pt-BR') !== activeLocation.name.toLocaleLowerCase('pt-BR')),
    ))
    setSavingAliases(true)
    try {
      await updateLocationAliases(projectId, activeLocation.id, aliases)
    } finally {
      setSavingAliases(false)
    }
  }

  // envia (ou substitui) a imagem do mapa do mundo do projeto
  const handleWorldMapChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !projectId) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setWorldMapError(validationError)
      return
    }

    setUploadingWorldMap(true)
    setWorldMapError('')
    try {
      const imageUrl = await uploadWorldMapImage(projectId, file)
      await updateWorldMapImage(projectId, imageUrl)
    } catch (error) {
      setWorldMapError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploadingWorldMap(false)
    }
  }

  const handleRemoveWorldMap = async () => {
    if (!projectId) return
    const confirmed = window.confirm('Remover o mapa do mundo?')
    if (!confirmed) return
    await updateWorldMapImage(projectId, null)
  }

  // envia (ou substitui) a imagem de um lugar específico
  const handleLocationImageChange = async (event: ChangeEvent<HTMLInputElement>, location: BookLocation) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !projectId) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setImageError(validationError)
      return
    }

    setUploadingLocationImageId(location.id)
    setImageError('')
    try {
      const imageUrl = await uploadLocationImage(projectId, location.id, file)
      await updateLocationImage(projectId, location.id, imageUrl)
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploadingLocationImageId(null)
    }
  }

  // pede pra IA varrer o manuscrito inteiro e apontar lugares que
  // aparecem no texto mas ainda não foram cadastrados na lista
  const handleDetectLocations = async () => {
    if (!projectId) return

    const chaptersWithContent = chapters
      .map((chapter) => ({ id: chapter.id, title: chapter.title, content: htmlToText(chapter.content) }))
      .filter((chapter) => chapter.content.length > 0)

    if (!chaptersWithContent.length) {
      setDetectError('Não há capítulos com texto pra analisar.')
      return
    }

    setDetecting(true)
    setDetectError('')
    try {
      const existingNames = locations.flatMap((location) => [location.name, ...(location.aliases ?? [])])
      const result = await aiProvider.detectBookLocations({ chapters: chaptersWithContent, existingNames })
      const normalizedExisting = new Set(existingNames.map((name) => name.toLocaleLowerCase('pt-BR')))
      const uniqueDetected = Array.from(new Set(
        result.locations
          .map((name) => name.trim())
          .filter((name) => name && !normalizedExisting.has(name.toLocaleLowerCase('pt-BR'))),
      ))
      setDetectedNames(uniqueDetected)
      setDetectedCollapsed(false)
      updateLocationDetectionAnalysis(projectId, { names: uniqueDetected, analyzedAt: Date.now() }).catch((error) =>
        console.error('Falha ao salvar lugares detectados:', error),
      )
    } catch (error) {
      setDetectError(error instanceof Error ? error.message : 'Não foi possível buscar os lugares do livro.')
    } finally {
      setDetecting(false)
    }
  }

  // adiciona um lugar detectado pela IA exatamente como se o autor
  // tivesse digitado o nome dele no campo de criação
  const handleAddDetectedLocation = async (name: string) => {
    if (!projectId) return
    setAddingDetectedName(name)
    try {
      const locationId = await createLocation(projectId, name)
      const remainingNames = detectedNames.filter((item) => item !== name)
      setDetectedNames(remainingNames)
      setActiveLocationId(locationId)
      updateLocationDetectionAnalysis(projectId, { names: remainingNames, analyzedAt: Date.now() }).catch((error) =>
        console.error('Falha ao salvar lugares detectados:', error),
      )
    } finally {
      setAddingDetectedName(null)
    }
  }

  const openAnalysis = () => {
    setAnalysisError('')
    setAnalysisScope('all')
    setSelectedChapterId(chapters[0]?.id ?? '')
    setAnalysisOpen(true)
  }

  // roda UMA análise que já preenche Detalhes + Conexões + Eventos —
  // mais barato que 3 chamadas separadas, porque o manuscrito só é
  // reenviado uma vez (ver aiProvider.analyzeLocationFull)
  const handleAnalyze = async () => {
    if (!projectId || !activeLocation) return

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
        locationName: activeLocation.name,
        locationAliases: activeLocation.aliases ?? [],
        chapters: chaptersWithContent,
        scope: analysisScope,
      }
      const result = await aiProvider.analyzeLocationFull(input)
      const analyzedAt = Date.now()
      await updateLocationFullAnalysis(projectId, activeLocation.id, {
        detailsAnalysis: { ...result.details, analyzedAt },
        connectionsAnalysis: { ...result.connections, analyzedAt },
        eventsAnalysis: { ...result.events, analyzedAt },
      })
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
          <p className={css.eyebrow}>Mundo do livro</p>
          <h1>Lugares</h1>
          <p>Organize informações extraídas do manuscrito sobre cada cenário e acompanhe como eles se conectam à história.</p>
        </div>
      </header>

      <nav className={css.tabs} aria-label="Áreas dos lugares">
        {(['Detalhes do lugar', 'Conexões', 'Principais eventos', 'Mapa do Mundo'] as LocationPageSection[]).map((section) => (
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
              <strong>Lugares</strong>
              <span>{locations.length} cadastrado{locations.length === 1 ? '' : 's'}</span>
            </div>
            <button
              type="button"
              className={detecting ? css.refreshButtonSpinning : css.refreshButton}
              onClick={() => void handleDetectLocations()}
              disabled={detecting || !chapters.length}
              title="Buscar lugares no livro"
              aria-label="Buscar lugares no livro"
            >
              <RefreshCw size={15} />
            </button>
          </div>

          <label className={css.search}>
            <Search size={15} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar lugar" />
          </label>

          <div className={css.locationList}>
            {filteredLocations.map((location) => (
              <button
                className={activeLocationId === location.id ? css.locationActive : css.location}
                key={location.id}
                type="button"
                onClick={() => setActiveLocationId(location.id)}
              >
                <span className={css.avatar}>
                  {location.imageUrl ? <img src={location.imageUrl} alt="" /> : initials(location.name)}
                </span>
                <span className={css.locationInfo}>
                  <strong>{location.name}</strong>
                  <small>{location.detailsAnalysis ? 'Análise disponível' : 'Aguardando análise'}</small>
                </span>
                <ChevronRight size={15} />
              </button>
            ))}

            {detectError && <p className={css.detectError}>{detectError}</p>}

            {pendingDetectedNames.length > 0 && (
              <>
                <button
                  type="button"
                  className={css.listDivider}
                  onClick={() => setDetectedCollapsed((current) => !current)}
                  aria-expanded={!detectedCollapsed}
                >
                  <ChevronRight size={12} className={detectedCollapsed ? undefined : css.listDividerChevronOpen} />
                  <span>Encontrados no livro ({pendingDetectedNames.length})</span>
                </button>
                {!detectedCollapsed && pendingDetectedNames.map((name) => (
                  <div className={css.locationPending} key={name}>
                    <span className={css.avatar}>{initials(name)}</span>
                    <span className={css.locationInfo}>
                      <strong>{name}</strong>
                      <small>Ainda não adicionado</small>
                    </span>
                    <button
                      type="button"
                      className={css.addDetectedButton}
                      onClick={() => void handleAddDetectedLocation(name)}
                      disabled={addingDetectedName === name}
                      title={`Adicionar ${name}`}
                      aria-label={`Adicionar ${name}`}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>

          <div className={css.createLocationLabel}>Adicionar lugar manualmente</div>
          <div className={css.createLocation}>
            <input
              value={newLocationName}
              onChange={(event) => setNewLocationName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void handleCreateLocation()
              }}
              placeholder="Nome do lugar que a IA não encontrou"
            />
            <button type="button" disabled={!newLocationName.trim() || creating} onClick={() => void handleCreateLocation()} title="Adicionar lugar" aria-label="Adicionar lugar">
              <Plus size={16} />
            </button>
          </div>
        </aside>

        <main className={css.content}>
          {activeSection === 'Mapa do Mundo' ? (
            <section className={css.worldMapCard}>
              <header className={css.worldMapHeader}>
                <div>
                  <p className={css.eyebrow}>Cartografia</p>
                  <h2>Mapa do mundo</h2>
                  <p>Guarde aqui a imagem do mapa geral do seu livro. É a mesma pra todos os lugares — não muda ao trocar o item selecionado ao lado.</p>
                </div>
                <div className={css.worldMapActions}>
                  <label className={css.worldMapUploadButton}>
                    <input type="file" accept="image/*" hidden onChange={(event) => void handleWorldMapChange(event)} disabled={uploadingWorldMap} />
                    {uploadingWorldMap ? 'Enviando...' : (worldMapImageUrl ? 'Trocar imagem' : 'Enviar imagem')}
                  </label>
                  {worldMapImageUrl && (
                    <button type="button" className={css.worldMapRemoveButton} onClick={() => void handleRemoveWorldMap()} title="Remover mapa">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </header>

              {worldMapImageUrl ? (
                <img className={css.worldMapImage} src={worldMapImageUrl} alt="Mapa do mundo do livro" />
              ) : (
                <div className={css.worldMapEmpty}>
                  <Map size={26} />
                  <p>Nenhum mapa enviado ainda.</p>
                </div>
              )}

              {worldMapError && <p className={css.worldMapError}>{worldMapError}</p>}
            </section>
          ) : activeSection === 'Conexões' && activeLocation ? (
            <section className="location-ai-section">
              <header className="location-ai-section__header">
                <div>
                  <p className={css.eyebrow}>Mapa relacional</p>
                  <h2>Conexões de {activeLocation.name}</h2>
                  <p>Outros lugares relacionados e personagens fortemente associados a este cenário.</p>
                </div>
                <button className={css.analyzeButton} onClick={openAnalysis}>
                  <Sparkles size={16} />{activeLocation.detailsAnalysis ? 'Atualizar análise com IA' : 'Gerar análise com IA'}
                </button>
              </header>
              {activeLocation.connectionsAnalysis?.connections.length ? (
                <div className="location-connection-groups">
                  {(['place', 'character'] as const).map((type) => {
                    const items = activeLocation.connectionsAnalysis?.connections.filter((item) => item.connectionType === type) ?? []
                    if (!items.length) return null
                    return (
                      <section className="location-connection-group" key={type}>
                        <h3>{type === 'place' ? 'Outros lugares' : 'Personagens associados'} <span>{items.length}</span></h3>
                        <div className="location-connection-cards">
                          {items.map((item, index) => (
                            <article key={`${item.name}-${index}`}>
                              <strong>{item.name}</strong>
                              <small>{item.relationshipLabel}</small>
                              <p>{item.context}</p>
                            </article>
                          ))}
                        </div>
                      </section>
                    )
                  })}
                </div>
              ) : (
                <div className={css.emptyAnalysis}>
                  <span><MapPinned size={30} /></span>
                  <h3>Mapeie as conexões do lugar</h3>
                  <p>A IA identifica outros lugares relacionados e personagens fortemente associados a este cenário.</p>
                  <button onClick={openAnalysis}><Sparkles size={16} /> Gerar análise com IA</button>
                </div>
              )}
            </section>
          ) : activeSection === 'Principais eventos' && activeLocation ? (
            <section className="location-ai-section">
              <header className="location-ai-section__header">
                <div>
                  <p className={css.eyebrow}>Presença narrativa</p>
                  <h2>Principais eventos</h2>
                  <p>Acompanhe os acontecimentos mais importantes que se passam em {activeLocation.name}.</p>
                </div>
                <button className={css.analyzeButton} onClick={openAnalysis}>
                  <Sparkles size={16} />{activeLocation.detailsAnalysis ? 'Atualizar análise com IA' : 'Gerar análise com IA'}
                </button>
              </header>
              {activeLocation.eventsAnalysis?.events.length ? (
                <div className="location-event-list">
                  {activeLocation.eventsAnalysis.events.map((item, index) => (
                    <article key={`${item.chapterId}-${index}`}>
                      <div className="location-event-index">{String(index + 1).padStart(2, '0')}</div>
                      <div>
                        <small>{item.chapterTitle}</small>
                        <h3>{item.title}</h3>
                        <p>{item.summary}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={css.emptyAnalysis}>
                  <span><FileSearch size={30} /></span>
                  <h3>Reconstrua os eventos deste lugar</h3>
                  <p>A IA resume os principais acontecimentos que acontecem em {activeLocation.name} ao longo do livro.</p>
                  <button onClick={openAnalysis}><Sparkles size={16} /> Gerar análise com IA</button>
                </div>
              )}
            </section>
          ) : activeSection !== 'Detalhes do lugar' ? (
            <div className={css.comingSoon}><strong>Selecione um lugar</strong></div>
          ) : activeLocation ? (
            <>
              <header className={css.locationHeader}>
                <div className={css.locationIdentity}>
                  <div className={css.imageWrap}>
                    <span className={css.largeAvatar}>
                      {activeLocation.imageUrl ? <img src={activeLocation.imageUrl} alt="" /> : initials(activeLocation.name)}
                    </span>
                    <label className={css.imageUpload} title={activeLocation.imageUrl ? 'Trocar imagem' : 'Adicionar imagem'}>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(event) => void handleLocationImageChange(event, activeLocation)}
                        disabled={uploadingLocationImageId === activeLocation.id}
                      />
                      {uploadingLocationImageId === activeLocation.id ? <span className={css.spinnerSmall} /> : <Camera size={12} />}
                    </label>
                  </div>
                  <div>
                    <p className={css.eyebrow}>Dossiê do lugar</p>
                    <h2>{activeLocation.name}</h2>
                    <span className={css.analysisStatus}>
                      <Clock3 size={13} />
                      {activeLocation.detailsAnalysis
                        ? `Analisado em ${new Date(activeLocation.detailsAnalysis.analyzedAt).toLocaleDateString('pt-BR')}`
                        : 'Nenhuma análise realizada'}
                    </span>
                  </div>
                </div>
                <div className={css.headerActions}>
                  <button className={css.deleteButton} type="button" onClick={() => void handleDeleteLocation()} title="Excluir lugar">
                    <Trash2 size={16} />
                  </button>
                  <button className={css.analyzeButton} type="button" onClick={openAnalysis} disabled={!chapters.length}>
                    <Sparkles size={16} />
                    {activeLocation.detailsAnalysis ? 'Atualizar análise com IA' : 'Gerar análise com IA'}
                  </button>
                </div>
              </header>

              {imageError && <p className={css.worldMapError}>{imageError}</p>}

              <section className={css.aliasPanel}>
                <div className={css.aliasIntro}>
                  <span><Tag size={17} /></span>
                  <div>
                    <strong>Nomes alternativos</strong>
                    <p>Informe apelidos ou outras formas como este lugar é chamado no livro. Separe por vírgula.</p>
                  </div>
                </div>
                <div className={css.aliasEditor}>
                  <input
                    value={aliasDraft}
                    onChange={(event) => setAliasDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') void handleSaveAliases()
                    }}
                    placeholder={`Ex.: ${activeLocation.name} antigo, apelido, outro nome`}
                  />
                  <button type="button" disabled={savingAliases} onClick={() => void handleSaveAliases()}>
                    {savingAliases ? 'Salvando...' : 'Salvar nomes'}
                  </button>
                </div>
                {(activeLocation.aliases?.length ?? 0) > 0 && (
                  <div className={css.aliasTags}>
                    {activeLocation.aliases?.map((alias) => <span key={alias}>{alias}</span>)}
                  </div>
                )}
              </section>

              {activeLocation.detailsAnalysis ? (
                <div className={css.detailGrid}>
                  {detailCards.map((card) => (
                    <article className={card.key === 'significance' || card.key === 'history' ? css.detailCardWide : css.detailCard} key={card.key}>
                      <p>{card.eyebrow}</p>
                      <h3>{card.label}</h3>
                      <div>{activeLocation.detailsAnalysis?.[card.key]}</div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className={css.emptyAnalysis}>
                  <span><Bot size={30} /></span>
                  <h3>Transforme o manuscrito em um dossiê</h3>
                  <p>A IA pode localizar descrições, atmosfera, importância na trama, histórico, conexões e principais eventos de {activeLocation.name} — tudo em uma única análise.</p>
                  <button type="button" onClick={openAnalysis} disabled={!chapters.length}>
                    <Sparkles size={16} /> Gerar análise com IA
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className={css.emptyLocation}>
              <MapPin size={30} />
              <h3>Crie seu primeiro lugar</h3>
              <p>Cadastre somente o nome. A IA preencherá os detalhes a partir dos capítulos.</p>
            </div>
          )}
        </main>
      </div>

      {analysisOpen && activeLocation && (
        <div className={css.overlay} onMouseDown={() => !analyzing && setAnalysisOpen(false)}>
          <section className={css.modal} role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <header className={css.modalHeader}>
              <div>
                <p className={css.eyebrow}>Análise literária com IA</p>
                <h2>Analisar {activeLocation.name}</h2>
                <p>Escolha quanto do manuscrito deve ser usado e confira os nomes associados ao lugar.</p>
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
                <span>{[activeLocation.name, ...(activeLocation.aliases ?? [])].join(' · ')}</span>
              </div>

              <div className={css.analysisIncludes}>
                <strong>Uma única análise preencherá</strong>
                <span>Descrição física · Atmosfera · Importância na trama · História do lugar · Conexões com outros lugares e personagens · Principais eventos</span>
              </div>

              {analysisError && <p className={css.error}>{analysisError}</p>}
            </div>

            <footer className={css.modalFooter}>
              <button className={css.cancelButton} type="button" disabled={analyzing} onClick={() => setAnalysisOpen(false)}>Cancelar</button>
              <button className={css.runButton} type="button" disabled={analyzing || (analysisScope === 'chapter' && !selectedChapterId)} onClick={() => void handleAnalyze()}>
                <Sparkles size={16} />
                {analyzing ? 'Analisando manuscrito...' : 'Iniciar análise'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  )
}
