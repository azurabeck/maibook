import { useEffect, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  Link,
  Image,
  Maximize2,
  Menu,
  MoreVertical,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { ChapterHeader } from '@/components/organisms/ChapterHeader/index'
import { ChapterGridSelector } from '@/components/organisms/ChapterGridSelector/index'
import { ChapterFooterSelector } from '@/components/organisms/ChapterFooterSelector/index'
import { BookPreview } from '@/components/organisms/BookPreview/index'
import { GrammarCheckModal } from '@/components/organisms/GrammarCheckModal/index'
import { DialogueSuggestModal } from '@/components/organisms/DialogueSuggestModal/index'
import { editorPanelCss } from './css'

// #region Ícones da barra de ferramentas
// Barra de formatação só visual por enquanto — os botões ainda não
// aplicam formatação de verdade. Isso entra quando trocarmos o
// <textarea> por um editor rico (Tiptap/Lexical).
const TOOLBAR_ICONS = [Bold, Italic, Underline, Strikethrough]
const LIST_ICONS = [List, ListOrdered]
const ALIGN_ICONS = [AlignLeft, AlignCenter]
// #endregion

export function EditorPanel() {
  const { currentProject, chapters, activeChapterId, updateChapterContent, updateChapterHeader, updateChapterGrid, updateAllChaptersGrid, updateChapterFooter, updateAllChaptersFooter, savingChapterId } = useProjectStore()
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)
  const isSaving = savingChapterId === activeChapterId
  const grid = activeChapter?.grid

  // #region Menu mobile das ações do cabeçalho (Grid/Footer padrão,
  // gramática, diálogo, visualizar livro) — no celular elas não cabem
  // lado a lado, então viram um menu hambúrguer (ver css.ts)
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false)
  const headerMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerMenuOpen) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (headerMenuRef.current && !headerMenuRef.current.contains(event.target as Node)) {
        setHeaderMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [headerMenuOpen])
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

  return (
    <section className={editorPanelCss.panel + ' ' + editorPanelCss.editorPanel}>
      {/* #region Cabeçalho do capítulo */}
      <div className={editorPanelCss.editorPanelHeader}>
        <div className={editorPanelCss.editorPanelTitleRow}>
          <h2>{activeChapter.title}</h2>
          <span className={editorPanelCss.editorPanelSaved}>
            <span className={editorPanelCss.dot} /> {isSaving ? 'Salvando...' : 'Salvo'}
          </span>
        </div>
        <button
          type="button"
          className={editorPanelCss.mobileMenuToggle}
          onClick={() => setHeaderMenuOpen((current) => !current)}
          aria-label={headerMenuOpen ? 'Fechar menu de ações' : 'Abrir menu de ações'}
          aria-expanded={headerMenuOpen}
        >
          <Menu size={16} />
        </button>

        <div
          className={headerMenuOpen ? editorPanelCss.editorPanelHeaderActionsOpen : editorPanelCss.editorPanelHeaderActions}
          ref={headerMenuRef}
        >
          {currentProject && (
            <ChapterGridSelector
              projectId={currentProject.id}
              currentGrid={activeChapter.grid}
              onApplyCurrent={(selectedGrid) => updateChapterGrid(activeChapter.id, selectedGrid)}
              onApplyAll={updateAllChaptersGrid}
            />
          )}
          {currentProject && (
            <ChapterFooterSelector
              projectId={currentProject.id}
              currentFooter={activeChapter.footer}
              onApplyCurrent={(selectedFooter) => updateChapterFooter(activeChapter.id, selectedFooter)}
              onApplyAll={updateAllChaptersFooter}
            />
          )}
          <GrammarCheckModal
            key={`grammar-${activeChapter.id}`}
            content={activeChapter.content}
            onApply={(newContent) => updateChapterContent(activeChapter.id, newContent)}
          />
          <DialogueSuggestModal
            key={`dialogue-${activeChapter.id}`}
            content={activeChapter.content}
            onApply={(newContent) => updateChapterContent(activeChapter.id, newContent)}
          />
          <BookPreview chapters={chapters} activeChapterId={activeChapterId} bookTitle={currentProject?.title} />
        </div>
      </div>
      {/* #endregion */}

      {/* #region Barra de ferramentas */}
      <div className={editorPanelCss.editorPanelToolbar}>
        <button className={editorPanelCss.toolbarDropdown}>Parágrafo ⌄</button>
        {TOOLBAR_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <span className={editorPanelCss.toolbarDivider} />
        <span className={editorPanelCss.toolbarQuote}>”</span>
        {LIST_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <span className={editorPanelCss.toolbarDivider} />
        {ALIGN_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <Quote size={16} />
        <Link size={16} />
        <Image size={16} />
        <div className={editorPanelCss.toolbarMeta}>
          <span className={editorPanelCss.editorPanelWordCount}>{wordCount} palavras</span>
          <Maximize2 size={16} />
          <MoreVertical size={16} />
        </div>
      </div>
      {/* #endregion */}

      {currentProject && (
        <ChapterHeader
          projectId={currentProject.id}
          value={activeChapter.header ?? null}
          onChange={(header) => updateChapterHeader(activeChapter.id, header)}
        />
      )}

      {/* #region Área de texto */}
      <div className={editorPanelCss.editorCanvas}>
        <textarea
          className={editorPanelCss.editorPanelTextarea}
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
      {/* #endregion */}

      {/* #region Rodapé */}
      <div className={editorPanelCss.editorPanelFooter}>
        {wordCount} palavras · {isSaving ? 'Salvando alterações...' : 'Tudo salvo no Firestore'}
      </div>
      {/* #endregion */}
    </section>
  )
}
