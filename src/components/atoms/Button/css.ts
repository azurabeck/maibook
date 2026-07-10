import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('button-atom-css', `
.btn {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  border: none;
  font-size: 14px;
}

.btn--primary {
  background: var(--accent-purple);
  color: white;
}

.btn--secondary {
  background: var(--bg-panel-alt);
  color: var(--text-primary);
  border: 1px solid var(--border);
}
`)

export const buttonCss = {
  root: 'btn',
  primary: 'btn--primary',
  secondary: 'btn--secondary',
} as const
