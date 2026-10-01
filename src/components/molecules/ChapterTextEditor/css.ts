import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('chapter-text-editor-molecule-css', `
.chapter-text-editor {
  display: flex;
  flex-direction: column;
  flex: 1 1 0;
  min-height: 0;
}

.chapter-text-editor__toolbar {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 4px 0;
}

.chapter-text-editor__button,
.chapter-text-editor__button--active {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
}

.chapter-text-editor__button:hover {
  color: var(--accent-purple);
  border-color: var(--accent-purple);
}

.chapter-text-editor__button--active {
  border-color: var(--accent-purple);
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
}

.chapter-text-editor__hint {
  margin-left: 6px;
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* a área rolável recebe a classe e o estilo (grid) que antes iam no
   <textarea>; o texto herda fonte, tamanho, alinhamento, etc. */
.chapter-text-editor__scroller {
  cursor: text;
}

.chapter-text-editor__content .ProseMirror {
  min-height: 100%;
  outline: none;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* cada parágrafo é uma linha do texto, igual ao antigo <textarea> */
.chapter-text-editor__content .ProseMirror p {
  margin: 0;
}

.chapter-text-editor__content .ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  height: 0;
  color: var(--text-muted);
  pointer-events: none;
}

@media (max-width: 680px) {
  .chapter-text-editor__hint { display: none; }
}

/* menu do botão direito (Adicionar ao Glossário) */
.chapter-text-editor__context-menu {
  position: fixed;
  z-index: 120;
  min-width: 200px;
  max-width: 320px;
  padding: 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--bg-panel);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
}

.chapter-text-editor__context-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--text-primary);
  font-size: 13px;
  text-align: left;
}

.chapter-text-editor__context-menu button:hover {
  background: var(--bg-panel-alt);
}

.chapter-text-editor__context-menu svg {
  flex: 0 0 auto;
  color: var(--accent-purple);
}

.chapter-text-editor__context-menu strong {
  overflow-wrap: anywhere;
}

/* sugestões de correção: em destaque, no topo do menu */
.chapter-text-editor__context-menu .chapter-text-editor__suggestion strong {
  color: var(--accent-purple);
  font-weight: 700;
}

.chapter-text-editor__context-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 7px 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.chapter-text-editor__context-divider {
  margin: 4px 0;
  border: 0;
  border-top: 1px solid var(--border);
}

.chapter-text-editor__context-note--delayed {
  animation: chapter-text-editor-appear 0s linear 0.25s both;
}

@keyframes chapter-text-editor-appear {
  from { visibility: hidden; }
  to { visibility: visible; }
}

.chapter-text-editor__spinner {
  animation: chapter-text-editor-spin 0.8s linear infinite;
}

@keyframes chapter-text-editor-spin {
  to { transform: rotate(360deg); }
}
`)

export const chapterTextEditorCss = {
  root: 'chapter-text-editor',
  toolbar: 'chapter-text-editor__toolbar',
  button: 'chapter-text-editor__button',
  buttonActive: 'chapter-text-editor__button--active',
  hint: 'chapter-text-editor__hint',
  scroller: 'chapter-text-editor__scroller',
  content: 'chapter-text-editor__content',
  contextMenu: 'chapter-text-editor__context-menu',
  contextMenuNote: 'chapter-text-editor__context-note',
  contextMenuNoteDelayed: 'chapter-text-editor__context-note--delayed',
  contextMenuDivider: 'chapter-text-editor__context-divider',
  suggestion: 'chapter-text-editor__suggestion',
  spinner: 'chapter-text-editor__spinner',
} as const
