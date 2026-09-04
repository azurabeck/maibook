import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import {
  Image as ImageIcon,
  Search,
  ChevronUp,
  ChevronDown,
  X,
  FileText,
  Layers,
  Trash2,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { ChapterHeader } from '@/components/organisms/ChapterHeader/index'
import { ChapterGridSelector } from '@/components/organisms/ChapterGridSelector/index'
import { ChapterFooterSelector } from '@/components/organisms/ChapterFooterSelector/index'
import { BookPreview } from '@/components/organisms/BookPreview/index'
import { GrammarCheckModal } from '@/components/organisms/GrammarCheckModal/index'
import { DialogueSuggestModal } from '@/components/organisms/DialogueSuggestModal/index'
import { uploadChapterPageImage, validateImageFile } from '@/services/storage/images'
import { scrollTextareaToIndex } from '@/utils/textareaCaret'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // #region Busca no texto do capítulo
  // Como o "editor" ainda é um <textarea> simples, a busca funciona
  // selecionando e rolando até cada trecho encontrado — não dá pra
  // pintar todas as ocorrências de cor, isso fica pra quando
  // trocarmos por um editor rico de verdade (Tiptap/Lexical).
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [matchIndex, setMatchIndex] = useState(0)

  const searchMatches = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const content = activeChapter?.content ?? ''
    if (!query) return [] as Array<{ start: number; end: number }>

    const found: Array<{ start: number; end: number }> = []
    const lowerContent = content.toLowerCase()
    let from = 0
    while (from <= lowerContent.length) {
      const index = lowerContent.indexOf(query, from)
      if (index === -1) break
      found.push({ start: index, end: index + query.length })
      from = index + query.length
    }
    return found
  }, [searchQuery, activeChapter?.content])

  function selectMatch(index: number) {
    const textarea = textareaRef.current
    const match = searchMatches[index]
    if (!textarea || !match) return
    textarea.focus()
    textarea.setSelectionRange(match.start, match.end)
    scrollTextareaToIndex(textarea, match.start)
  }

  // ao digitar uma nova busca, volta pro primeiro resultado
  useEffect(() => {
    setMatchIndex(0)
    if (searchMatches.length) selectMatch(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  function goToMatch(step: 1 | -1) {
    if (!searchMatches.length) return
    const next = (matchIndex + step + searchMatches.length) % searchMatches.length
    setMatchIndex(next)
    selectMatch(next)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
    setMatchIndex(0)
  }

  function toggleSearch() {
    setSearchOpen((current) => {
      const next = !current
      if (!next) {
        setSearchQuery('')
        setMatchIndex(0)
      }
      return next
    })
  }
  // #endregion

  // conta palavras a partir do texto (separa por espaços em branco)
  const wordCount = activeChapter?.content.trim()
    ? activeChapter.content.trim().split(/\s+/).length
    : 0

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
            {searchQuery.trim() ? (searchMatches.length ? `${matchIndex + 1} de ${searchMatches.length}` : 'Nenhum resultado') : ''}
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
            onApply={(newContent) => updateChapterContent(activeChapter.id, newContent)}
          />
        )}
        {!isFullImagePage && (
          <DialogueSuggestModal
            key={`dialogue-${activeChapter.id}`}
            content={activeChapter.content}
            onApply={(newContent) => updateChapterContent(activeChapter.id, newContent)}
          />
        )}
        <BookPreview chapters={chapters} activeChapterId={activeChapterId} bookTitle={currentProject?.title} />
      </div>
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
          <textarea
            ref={textareaRef}
            className={
              isBackgroundPage && activeChapter.pageImageUrl
                ? `${editorPanelCss.editorPanelTextarea} ${editorPanelCss.editorPanelTextareaOnImage}`
                : editorPanelCss.editorPanelTextarea
            }
            value={activeChapter.content}
            placeholder="Comece a escrever..."
            style={grid ? {
              fontFamily: grid.fontFamily,
              fontSize: `${grid.fontSize}pt`,
              lineHeight: grid.lineHeight,
              textAlign: grid.textAlignment,
              hyphens: grid.hyphenation ? 'auto' : 'none',
              overflowWrap: 'break-word',
            } : undefined}
            // A grid formata apenas o texto durante a escrita.
            // Página, margens, cabeçalho e rodapé pertencem à visualização do livro.
            onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
          />
        </div>
      )}
      {/* #endregion */}

      {/* #region Rodapé */}
      <div className={editorPanelCss.editorPanelFooter}>
        {wordCount} palavras · {isSaving ? 'Salvando alterações...' : 'Tudo salvo no Firestore'}
      </div>
      {/* #endregion */}
    </section>
  )
}
