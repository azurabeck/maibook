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
`)

export const chapterTextEditorCss = {
  root: 'chapter-text-editor',
  toolbar: 'chapter-text-editor__toolbar',
  button: 'chapter-text-editor__button',
  buttonActive: 'chapter-text-editor__button--active',
  hint: 'chapter-text-editor__hint',
  scroller: 'chapter-text-editor__scroller',
  content: 'chapter-text-editor__content',
} as const
