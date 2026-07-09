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

// #region Ícones da barra de ferramentas
// Barra de formatação só visual por enquanto — os botões ainda não
// aplicam formatação de verdade. Isso entra quando trocarmos o
// <textarea> por um editor rico (Tiptap/Lexical).
const TOOLBAR_ICONS = [Bold, Italic, Underline, Strikethrough]
const LIST_ICONS = [List, ListOrdered]
const ALIGN_ICONS = [AlignLeft, AlignCenter]
// #endregion

export function EditorPanel() {
  const { chapters, activeChapterId, updateChapterContent } = useProjectStore()
  const activeChapter = chapters.find((ch) => ch.id === activeChapterId)

  // conta palavras a partir do texto (separa por espaços em branco)
  const wordCount = activeChapter?.content.trim()
    ? activeChapter.content.trim().split(/\s+/).length
    : 0

  if (!activeChapter) {
    return (
      <section className="panel editor-panel editor-panel--empty">
        <p>Selecione um capítulo na lista ao lado para começar a escrever.</p>
      </section>
    )
  }

  return (
    <section className="panel editor-panel">
      {/* #region Cabeçalho do capítulo */}
      <div className="editor-panel__header">
        <div className="editor-panel__title-row">
          <h2>{activeChapter.title}</h2>
          <span className="editor-panel__saved">
            <span className="dot" /> Salvo há 2 min
          </span>
        </div>
        <div className="editor-panel__header-actions">
          <span className="editor-panel__word-count">{wordCount} palavras</span>
          <Maximize2 size={16} />
          <MoreVertical size={16} />
        </div>
      </div>
      {/* #endregion */}

      {/* #region Barra de ferramentas */}
      <div className="editor-panel__toolbar">
        <button className="toolbar-dropdown">Parágrafo ⌄</button>
        {TOOLBAR_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <span className="toolbar-divider" />
        <span className="toolbar-quote">”</span>
        {LIST_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <span className="toolbar-divider" />
        {ALIGN_ICONS.map((Icon, i) => (
          <Icon key={i} size={16} />
        ))}
        <Quote size={16} />
        <Link size={16} />
        <Image size={16} />
      </div>
      {/* #endregion */}

      {/* #region Área de texto */}
      <textarea
        className="editor-panel__textarea"
        value={activeChapter.content}
        placeholder="Comece a escrever..."
        // toda tecla digitada atualiza o capítulo ativo no store global
        onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
      />
      {/* #endregion */}

      {/* #region Rodapé */}
      <div className="editor-panel__footer">
        {wordCount} palavras · Última edição há 2 min
      </div>
      {/* #endregion */}
    </section>
  )
}
