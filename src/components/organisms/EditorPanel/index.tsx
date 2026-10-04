import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Image as ImageIcon,
  Link2,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  FileText,
  Layers,
  Trash2,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { useUiStore } from '@/store/useUiStore'
import { ChapterHeader } from '@/components/organisms/ChapterHeader/index'
import { ChapterGridSelector } from '@/components/organisms/ChapterGridSelector/index'
import { ChapterFooterSelector } from '@/components/organisms/ChapterFooterSelector/index'
import { BookPreview } from '@/components/organisms/BookPreview/index'
import { GrammarCheckModal } from '@/components/organisms/GrammarCheckModal/index'
import { DialogueSuggestModal } from '@/components/organisms/DialogueSuggestModal/index'
import { INVALID_IMAGE_LINK_MESSAGE, parseImageLink, uploadChapterPageImage, validateImageFile } from '@/services/storage/images'
import { ChapterTextEditor, contentToDoc } from '@/components/molecules/ChapterTextEditor/index'
import { stripInline } from '@/utils/inlineFormat'
import { addGlossaryTermWithAi, findGlossaryTerm, useGlossaryTerms } from '@/services/glossary'
import { checkWordSpelling, preloadSpellchecker, setGlossaryWords } from '@/services/spelling'
import type { Editor } from '@tiptap/react'
import type { ChapterPageType } from '@/types'
import { editorPanelCss } from './css'

// #region Tipo de página do capítulo (ver ChapterPageType em types/index.ts)
const PAGE_TYPE_OPTIONS: Array<{ value: ChapterPageType; label: string; icon: typeof FileText }> = [
  { value: 'text', label: 'Texto', icon: FileText },
  { value: 'image', label: 'Imagem', icon: ImageIcon },
  { value: 'background', label: 'Fundo', icon: Layers },
]

function PageTypeSwitch({ value, onChange }: { value: ChapterPageType; onChange: (pageType: ChapterPageType) => void }) {
  return (
    <div className={editorPanelCss.pageTypeSwitch} role="group" aria-label="Tipo de página do capítulo">
      {PAGE_TYPE_OPTIONS.map(({ value: optionValue, label, icon: Icon }) => (
        <button
          key={optionValue}
          type="button"
          className={value === optionValue ? editorPanelCss.pageTypeButtonActive : editorPanelCss.pageTypeButton}
          onClick={() => onChange(optionValue)}
          title={`Página de ${label.toLowerCase()}`}
        >
          <Icon size={14} /> <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
// #endregion

// #region Upload da imagem de página (tipo "image" = página inteira / "background" = fundo)
interface ChapterPageImageControlProps {
  projectId: string
  chapterId: string
  imageUrl?: string
  variant: 'full' | 'background'
  onChange: (url: string | null) => Promise<void>
}

function ChapterPageImageControl({ projectId, chapterId, imageUrl, variant, onChange }: ChapterPageImageControlProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [linkDraft, setLinkDraft] = useState('')

  async function handleLink() {
    if (!linkDraft.trim()) return
    const url = parseImageLink(linkDraft)
    if (!url) {
      setError(INVALID_IMAGE_LINK_MESSAGE)
      return
    }
    setError('')
    try {
      await onChange(url)
      setLinkDraft('')
    } catch {
      setError('Não foi possível salvar o link da imagem.')
    }
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setUploading(true)
    setError('')
    try {
      const url = await uploadChapterPageImage(projectId, chapterId, file)
      await onChange(url)
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Não foi possível enviar a imagem.')
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove() {
    setError('')
    try {
      await onChange(null)
    } catch {
      setError('Não foi possível remover a imagem.')
    }
  }

  if (variant === 'full') {
    return (
      <div className={editorPanelCss.pageImageFull}>
        {imageUrl ? (
          <img className={editorPanelCss.pageImageFullPreview} src={imageUrl} alt="Imagem da página" />
        ) : (
          <div className={editorPanelCss.pageImageFullEmpty}>
            <ImageIcon size={32} />
            <p>Esta página é apenas uma imagem, ocupando toda a largura e altura.</p>
          </div>
        )}
        <div className={editorPanelCss.pageImageFullActions}>
          <label className={editorPanelCss.pageImageUploadButton}>
            <input type="file" accept="image/*" hidden onChange={(event) => void handleFile(event)} disabled={uploading} />
            {uploading ? 'Enviando...' : imageUrl ? 'Trocar imagem' : 'Enviar imagem'}
          </label>
          {imageUrl && (
            <button className={editorPanelCss.pageImageRemoveButton} type="button" onClick={() => void handleRemove()}>
              <Trash2 size={14} /> Remover
            </button>
          )}
        </div>
        <div className={editorPanelCss.pageImageLinkRow}>
          <input
            type="url"
            placeholder="Ou cole o link de uma imagem"
            value={linkDraft}
            onChange={(event) => setLinkDraft(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') void handleLink() }}
          />
          <button type="button" onClick={() => void handleLink()} disabled={!linkDraft.trim()}>
            <Link2 size={14} /> Usar link
          </button>
        </div>
        {error && <p className={editorPanelCss.pageImageError}>{error}</p>}
      </div>
    )
  }

  return (
    <div className={editorPanelCss.pageBackgroundBar}>
      <span className={editorPanelCss.pageBackgroundLabel}><ImageIcon size={14} /> Fundo da página</span>
      {imageUrl && <img className={editorPanelCss.pageBackgroundThumb} src={imageUrl} alt="" />}
      <label className={editorPanelCss.pageImageUploadButtonSmall}>
        <input type="file" accept="image/*" hidden onChange={(event) => void handleFile(event)} disabled={uploading} />
        {uploading ? 'Enviando...' : imageUrl ? 'Trocar' : 'Adicionar imagem'}
      </label>
      <div className={editorPanelCss.pageImageLinkRowSmall}>
        <input
          type="url"
          placeholder="ou cole um link"
          value={linkDraft}
          onChange={(event) => setLinkDraft(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') void handleLink() }}
        />
        <button type="button" onClick={() => void handleLink()} disabled={!linkDraft.trim()} title="Usar link da imagem">
          <Link2 size={13} />
        </button>
      </div>
      {imageUrl && (
        <button className={editorPanelCss.pageImageRemoveButtonSmall} type="button" onClick={() => void handleRemove()} title="Remover fundo">
          <Trash2 size={13} />
        </button>
      )}
      {error && <span className={editorPanelCss.pageImageErrorSmall}>{error}</span>}
    </div>
  )
}
// #endregion

export function EditorPanel() {
  const {
    currentProject,
    chapters,
    activeChapterId,
    updateChapterContent,
    updateChapterHeader,
    updateChapterGrid,
    updateAllChaptersGrid,
    updateChapterFooter,
    updateAllChaptersFooter,
    updateChapterPageType,
    updateChapterPageImage,
    savingChapterId,
  } = useProjectStore()
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)
  const isSaving = savingChapterId === activeChapterId
  const grid = activeChapter?.grid
  const pageType: ChapterPageType = activeChapter?.pageType ?? 'text'
  // instância do editor de texto (Tiptap) do capítulo ativo — usada
  // pela busca e pra aplicar as revisões da IA
  const [textEditor, setTextEditor] = useState<Editor | null>(null)
  const handleEditorReady = useCallback((editor: Editor | null) => setTextEditor(editor), [])

  // #region Botão direito → "Adicionar ao Glossário"
  // Cria o termo e pede à IA o verbete (resumo de até 2 linhas com base
  // no livro). Um aviso rápido no rodapé do editor mostra o andamento.
  const { terms: glossaryTerms } = useGlossaryTerms(currentProject?.id)

  // corretor ortográfico do mesmo menu: dicionário pt-BR carregado em
  // segundo plano ao abrir o editor + termos do glossário como corretos
  useEffect(() => { preloadSpellchecker() }, [])
  useEffect(() => { setGlossaryWords(glossaryTerms.map((item) => item.term)) }, [glossaryTerms])
  const [glossaryNotice, setGlossaryNotice] = useState<{ tone: 'info' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!glossaryNotice || glossaryNotice.text.endsWith('...')) return
    const timer = window.setTimeout(() => setGlossaryNotice(null), 4500)
    return () => window.clearTimeout(timer)
  }, [glossaryNotice])

  async function handleAddToGlossary(term: string, context: string) {
    if (!currentProject) return
    if (findGlossaryTerm(glossaryTerms, term)) {
      setGlossaryNotice({ tone: 'info', text: `“${term}” já está no glossário (Estruturas → Glossário).` })
      return
    }
    setGlossaryNotice({ tone: 'info', text: `“${term}” adicionado ao glossário — a IA está escrevendo a definição...` })
    try {
      await addGlossaryTermWithAi(
        currentProject.id,
        { term, context, sourceChapterId: activeChapterId ?? undefined },
        { bookTitle: currentProject.title, chapters, sections: currentProject.sections },
        ({ ok, error }) => setGlossaryNotice(ok
          ? { tone: 'info', text: `Definição de “${term}” pronta. Veja ou edite em Estruturas → Glossário.` }
          : { tone: 'error', text: `“${term}” entrou no glossário, mas a IA não conseguiu definir: ${error instanceof Error ? error.message : 'erro desconhecido'}` }),
      )
    } catch (error) {
      console.error('Falha ao adicionar ao glossário:', error)
      setGlossaryNotice({ tone: 'error', text: `Não foi possível adicionar “${term}” ao glossário: ${error instanceof Error ? error.message : 'erro desconhecido'}` })
    }
  }
  // #endregion

  // revisão da IA (gramática/diálogos) devolve o texto inteiro: passa
  // pelo editor (entra no Ctrl+Z e dispara o salvamento normal)
  function applyRevisedContent(chapterId: string, newContent: string) {
    if (textEditor) textEditor.commands.setContent(contentToDoc(newContent))
    else updateChapterContent(chapterId, newContent)
  }

  // #region Busca no texto do capítulo
  // A busca percorre o documento do editor e, ao navegar, seleciona o
  // trecho encontrado e rola até ele. (Ainda não pinta todas as
  // ocorrências de cor ao mesmo tempo.)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // -1 = ainda não navegou pra nenhuma ocorrência (só contando).
  // Importante: navegar (selectMatch) foca o editor do conteúdo,
  // então só pode acontecer quando a pessoa pede explicitamente
  // (Enter ou os botões de próximo/anterior) — nunca a cada tecla
  // digitada na busca, senão o foco pula do campo de busca pro texto
  // no meio da digitação e as próximas teclas se perdem.
  const [matchIndex, setMatchIndex] = useState(-1)

  // posições (from/to) no documento do editor. Cada parágrafo só tem
  // texto, então o índice dentro do texto do parágrafo + a posição
  // de início do parágrafo dá a posição exata no documento. A busca
  // não atravessa parágrafos (uma quebra de linha no meio não casa).
  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const found: Array<{ from: number; to: number }> = []
    if (!query || !textEditor) return found

    textEditor.state.doc.forEach((paragraph, offset) => {
      const text = paragraph.textContent.toLowerCase()
      let from = 0
      while (from <= text.length) {
        const index = text.indexOf(query, from)
        if (index === -1) break
        found.push({ from: offset + 1 + index, to: offset + 1 + index + query.length })
        from = index + query.length
      }
    })
    return found
    // activeChapter.content: recalcula quando o texto muda
  }, [searchQuery, textEditor, activeChapter?.content])

  function selectMatch(index: number) {
    const match = searchMatches[index]
    if (!textEditor || !match) return
    textEditor.chain().focus().setTextSelection(match).scrollIntoView().run()
  }

  // ao digitar uma nova busca, só reseta a contagem — não navega até
  // o texto (ver comentário acima), deixa a pessoa terminar de digitar
  useEffect(() => {
    setMatchIndex(-1)
  }, [searchQuery])

  function goToMatch(step: 1 | -1) {
    if (!searchMatches.length) return
    const next = matchIndex === -1
      ? (step === 1 ? 0 : searchMatches.length - 1)
      : (matchIndex + step + searchMatches.length) % searchMatches.length
    setMatchIndex(next)
    selectMatch(next)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
    setMatchIndex(-1)
  }

  function toggleSearch() {
    setSearchOpen((current) => {
      const next = !current
      if (!next) {
        setSearchQuery('')
        setMatchIndex(-1)
      }
      return next
    })
  }
  // #endregion

  // #region Modo de foco (esconde cabeçalho e painéis ao redor)
  const focusMode = useUiStore((state) => state.focusMode)
  const toggleFocusMode = useUiStore((state) => state.toggleFocusMode)
  // #endregion

  // recolhe a linha de ferramentas do capítulo (grid, rodapé, IA,
  // visualizar livro) pra sobrar mais espaço de leitura do texto
  const [toolsCollapsed, setToolsCollapsed] = useState(false)

  // conta palavras a partir do texto sem as marcações de negrito/itálico
  const plainContent = activeChapter ? stripInline(activeChapter.content).trim() : ''
  const wordCount = plainContent ? plainContent.split(/\s+/).length : 0

  if (!activeChapter) {
    return (
      <section className={editorPanelCss.panel + ' ' + editorPanelCss.editorPanel + ' ' + editorPanelCss.editorPanelEmpty}>
        <p>Selecione um capítulo na lista ao lado para começar a escrever.</p>
      </section>
    )
  }

  const isFullImagePage = pageType === 'image'
  const isBackgroundPage = pageType === 'background'

  return (
    <section className={editorPanelCss.panel + ' ' + editorPanelCss.editorPanel}>
      {/* #region Cabeçalho do capítulo: só o título e a busca ficam
          aqui em cima — o resto das ações vive na linha abaixo. */}
      <div className={editorPanelCss.editorPanelHeader}>
        <div className={editorPanelCss.editorPanelTitleRow}>
          <h2>{activeChapter.title}</h2>
          <span className={editorPanelCss.editorPanelSaved}>
            <span className={editorPanelCss.dot} /> {isSaving ? 'Salvando...' : 'Salvo'}
          </span>
        </div>

        <div className={editorPanelCss.editorPanelHeaderActions}>
          {!isFullImagePage && (
            <button
              className={searchOpen ? editorPanelCss.searchToggleActive : editorPanelCss.searchToggle}
              type="button"
              onClick={toggleSearch}
              title="Buscar no texto"
            >
              <Search size={15} /> <span>Buscar</span>
            </button>
          )}
          <button
            className={focusMode ? editorPanelCss.searchToggleActive : editorPanelCss.searchToggle}
            type="button"
            onClick={toggleFocusMode}
            title={focusMode ? 'Sair do modo de foco' : 'Modo de foco: esconder menus e cabeçalho'}
          >
            {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            <span>{focusMode ? 'Sair do foco' : 'Modo de foco'}</span>
          </button>
        </div>
      </div>
      {/* #endregion */}

      {/* #region Barra de busca */}
      {searchOpen && !isFullImagePage && (
        <div className={editorPanelCss.searchBar}>
          <Search size={15} className={editorPanelCss.searchBarIcon} />
          <input
            className={editorPanelCss.searchBarInput}
            type="text"
            autoFocus
            placeholder="Buscar palavra ou trecho no texto..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') goToMatch(event.shiftKey ? -1 : 1)
              if (event.key === 'Escape') closeSearch()
            }}
          />
          <span className={editorPanelCss.searchBarCount}>
            {searchQuery.trim()
              ? (searchMatches.length
                ? (matchIndex === -1
                  ? `${searchMatches.length} resultado${searchMatches.length === 1 ? '' : 's'}`
                  : `${matchIndex + 1} de ${searchMatches.length}`)
                : 'Nenhum resultado')
              : ''}
          </span>
          <button type="button" onClick={() => goToMatch(-1)} disabled={!searchMatches.length} title="Anterior (Shift+Enter)">
            <ChevronUp size={16} />
          </button>
          <button type="button" onClick={() => goToMatch(1)} disabled={!searchMatches.length} title="Próximo (Enter)">
            <ChevronDown size={16} />
          </button>
          <button type="button" onClick={closeSearch} title="Fechar busca">
            <X size={16} />
          </button>
        </div>
      )}
      {/* #endregion */}

      {/* #region Ações do capítulo (grid, footer, cabeçalho, IA, visualizar livro) */}
      <div className={editorPanelCss.actionsToggleRow}>
        <button
          type="button"
          className={editorPanelCss.actionsToggle}
          onClick={() => setToolsCollapsed((current) => !current)}
          title={toolsCollapsed ? 'Mostrar ferramentas do capítulo' : 'Esconder ferramentas do capítulo'}
          aria-expanded={!toolsCollapsed}
        >
          {toolsCollapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          <span>Ferramentas do capítulo</span>
        </button>
      </div>

      {!toolsCollapsed && (
        <div className={editorPanelCss.editorPanelActionsRow}>
          <PageTypeSwitch value={pageType} onChange={(newPageType) => void updateChapterPageType(activeChapter.id, newPageType)} />

          {!isFullImagePage && currentProject && (
            <ChapterGridSelector
              projectId={currentProject.id}
              currentGrid={activeChapter.grid}
              onApplyCurrent={(selectedGrid) => updateChapterGrid(activeChapter.id, selectedGrid)}
              onApplyAll={updateAllChaptersGrid}
            />
          )}
          {!isFullImagePage && currentProject && (
            <ChapterFooterSelector
              projectId={currentProject.id}
              currentFooter={activeChapter.footer}
              onApplyCurrent={(selectedFooter) => updateChapterFooter(activeChapter.id, selectedFooter)}
              onApplyAll={updateAllChaptersFooter}
            />
          )}
          {!isFullImagePage && (
            <GrammarCheckModal
              key={`grammar-${activeChapter.id}`}
              content={activeChapter.content}
              onApply={(newContent) => applyRevisedContent(activeChapter.id, newContent)}
            />
          )}
          {!isFullImagePage && (
            <DialogueSuggestModal
              key={`dialogue-${activeChapter.id}`}
              content={activeChapter.content}
              onApply={(newContent) => applyRevisedContent(activeChapter.id, newContent)}
            />
          )}
          <BookPreview chapters={chapters} activeChapterId={activeChapterId} bookTitle={currentProject?.title} cover={currentProject?.cover} summary={currentProject?.summary} sections={currentProject?.sections} />
        </div>
      )}
      {/* #endregion */}

      {!isFullImagePage && currentProject && (
        <ChapterHeader
          projectId={currentProject.id}
          value={activeChapter.header ?? null}
          onChange={(header) => updateChapterHeader(activeChapter.id, header)}
        />
      )}

      {/* #region Área de conteúdo */}
      {isFullImagePage ? (
        currentProject && (
          <ChapterPageImageControl
            projectId={currentProject.id}
            chapterId={activeChapter.id}
            imageUrl={activeChapter.pageImageUrl}
            variant="full"
            onChange={(url) => updateChapterPageImage(activeChapter.id, url)}
          />
        )
      ) : (
        <div
          className={editorPanelCss.editorCanvas}
          style={isBackgroundPage && activeChapter.pageImageUrl ? {
            backgroundImage: `url(${activeChapter.pageImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
        >
          {isBackgroundPage && currentProject && (
            <ChapterPageImageControl
              projectId={currentProject.id}
              chapterId={activeChapter.id}
              imageUrl={activeChapter.pageImageUrl}
              variant="background"
              onChange={(url) => updateChapterPageImage(activeChapter.id, url)}
            />
          )}
          <ChapterTextEditor
            key={activeChapter.id}
            content={activeChapter.content}
            savePending={isSaving}
            onChange={(content) => updateChapterContent(activeChapter.id, content)}
            onReady={handleEditorReady}
            onAddToGlossary={(term, context) => void handleAddToGlossary(term, context)}
            onCheckSpelling={checkWordSpelling}
            className={
              isBackgroundPage && activeChapter.pageImageUrl
                ? `${editorPanelCss.editorPanelTextarea} ${editorPanelCss.editorPanelTextareaOnImage}`
                : editorPanelCss.editorPanelTextarea
            }
            // A grid formata apenas o texto durante a escrita.
            // Página, margens, cabeçalho e rodapé pertencem à visualização do livro.
            style={grid ? {
              fontFamily: grid.fontFamily,
              fontSize: `${grid.fontSize}pt`,
              lineHeight: grid.lineHeight,
              textAlign: grid.textAlignment,
              hyphens: grid.hyphenation ? 'auto' : 'none',
              overflowWrap: 'break-word',
            } : undefined}
          />
        </div>
      )}
      {/* #endregion */}

      {/* #region Rodapé */}
      {glossaryNotice && (
        <div className={glossaryNotice.tone === 'error' ? editorPanelCss.glossaryNoticeError : editorPanelCss.glossaryNotice} role="status">
          {glossaryNotice.text}
          <button type="button" onClick={() => setGlossaryNotice(null)} aria-label="Fechar aviso"><X size={13} /></button>
        </div>
      )}
      <div className={editorPanelCss.editorPanelFooter}>
        {wordCount} palavras · {isSaving ? 'Salvando alterações...' : 'Tudo salvo no Firestore'}
      </div>
      {/* #endregion */}
    </section>
  )
}
