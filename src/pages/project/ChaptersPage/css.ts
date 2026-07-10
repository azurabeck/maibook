import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('chapters-page-css', `
.chapters-page {
  height: 100%;
  display: grid;
  grid-template-columns: 240px 1fr 300px 240px;
  gap: 16px;
}

.chapters-page .panel {
  padding: 16px;
  min-height: 0;
  overflow-y: auto;
}
`)

export const chaptersPageCss = {
  root: 'chapters-page',
} as const
