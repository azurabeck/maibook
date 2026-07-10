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
  MoreVertical,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { ChapterHeader } from '@/components/organisms/ChapterHeader/index'
import { ChapterGridSelector } from '@/components/organisms/ChapterGridSelector/index'
import { BookPreview } from '@/components/organisms/BookPreview/index'
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
  const { currentProject, chapters, activeChapterId, updateChapterContent, updateChapterHeader, updateChapterGrid, updateAllChaptersGrid, savingChapterId } = useProjectStore()
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)
  const isSaving = savingChapterId === activeChapterId
  const grid = activeChapter?.grid

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
        <div className={editorPanelCss.editorPanelHeaderActions}>
          {currentProject && (
            <ChapterGridSelector
              projectId={currentProject.id}
              currentGrid={activeChapter.grid}
              onApplyCurrent={(selectedGrid) => updateChapterGrid(activeChapter.id, selectedGrid)}
              onApplyAll={updateAllChaptersGrid}
            />
          )}
          <BookPreview chapters={chapters} activeChapterId={activeChapterId} bookTitle={currentProject?.title} />
          <span className={editorPanelCss.editorPanelWordCount}>{wordCount} palavras</span>
          <Maximize2 size={16} />
          <MoreVertical size={16} />
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
