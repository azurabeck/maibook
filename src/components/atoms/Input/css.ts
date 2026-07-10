import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('input-atom-css', `
.input {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-strong);
  width: 100%;
  background: var(--bg-panel);
  color: var(--text-primary);
}
`)

export const inputCss = {
  input: 'input',
} as const
