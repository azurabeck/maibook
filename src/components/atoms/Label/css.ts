import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('label-atom-css', `
.label {
  font-size: 13px;
  color: var(--text-secondary);
}
`)

export const labelCss = {
  label: 'label',
} as const
