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
  const { currentProject, chapters, activeChapterId, updateChapterContent, updateChapterHeader, savingChapterId } = useProjectStore()
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)
  const isSaving = savingChapterId === activeChapterId

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
      <textarea
        className={editorPanelCss.editorPanelTextarea}
        value={activeChapter.content}
        placeholder="Comece a escrever..."
        // toda tecla digitada atualiza o capítulo ativo no store global
        onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
      />
      {/* #endregion */}

      {/* #region Rodapé */}
      <div className={editorPanelCss.editorPanelFooter}>
        {wordCount} palavras · {isSaving ? 'Salvando alterações...' : 'Tudo salvo no Firestore'}
      </div>
      {/* #endregion */}
    </section>
  )
}
