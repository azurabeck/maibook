import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('structure-page-css', `
.structure-page {
  width: 100%;
  margin: 0 auto;
}

.structure-page__title {
  margin: 0 0 16px;
  font-size: 24px;
}

.structure-page__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.structure-page__tab {
  padding: 7px 14px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--bg-panel);
  color: var(--text-secondary);
  font-size: 12px;
}

.structure-page__tab:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.structure-page__tab--active {
  border-color: var(--accent-purple);
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-weight: 700;
}

.structure-page__content {
  min-height: 320px;
  padding: 22px;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.structure-page__placeholder {
  min-height: 270px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
}
`)

export const structurePageCss = {
  root: 'structure-page',
  title: 'structure-page__title',
  tabs: 'structure-page__tabs',
  tab: 'structure-page__tab',
  tabActive: 'structure-page__tab structure-page__tab--active',
  content: 'structure-page__content',
  placeholder: 'structure-page__placeholder',
} as const
