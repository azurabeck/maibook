import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('subsection-page-molecule-css', `
.subsection-page__title {
  margin: 0 0 16px;
}

.subsection-page__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.pill {
  border: 1px solid var(--border-strong);
  background: var(--bg-panel);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 13px;
}

.pill.active {
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  border-color: var(--accent-purple);
  font-weight: 600;
}

.subsection-page__content {
  padding: 24px;
  color: var(--text-secondary);
  font-size: 14px;
}
`)

export const subsectionPageCss = {
  subsectionPage: 'subsection-page',
  subsectionPageTitle: 'subsection-page__title',
  subsectionPagePills: 'subsection-page__pills',
  subsectionPagePill: 'pill',
  subsectionPagePillActive: 'pill active',
  subsectionPageContent: 'subsection-page__content',
  panel: 'panel',
} as const
