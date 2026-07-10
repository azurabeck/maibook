import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('form-field-molecule-css', `
.form-field {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
`)

export const formFieldCss = {
  formField: 'form-field',
} as const
