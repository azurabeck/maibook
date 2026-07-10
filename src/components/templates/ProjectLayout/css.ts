import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('project-layout-template-css', `
.project-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.project-layout__content {
  flex: 1;
  min-height: 0;
  padding: 20px 24px;
}
`)

export const projectLayoutCss = {
  projectLayout: 'project-layout',
  projectLayoutContent: 'project-layout__content',
} as const
