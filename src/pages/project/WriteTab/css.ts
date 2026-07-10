import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('write-tab-page-css', `
.write-tab {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.write-tab h2 {
  margin: 0;
  font-size: 22px;
}

.write-tab__editor {
  flex: 1;
  min-height: 320px;
  width: 100%;
  resize: none;
  padding: 16px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-strong);
  background: var(--bg-panel);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.7;
  outline: none;
}

.write-tab__editor:focus {
  border-color: var(--accent-purple);
}

.write-tab__ai-tools {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 900px) {
  .write-tab__ai-tools {
    grid-template-columns: 1fr;
  }
}
`)

export const writeTabCss = {
  root: 'write-tab',
  editor: 'write-tab__editor',
  aiTools: 'write-tab__ai-tools',
} as const
