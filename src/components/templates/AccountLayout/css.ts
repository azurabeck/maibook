import { injectStyleSheet } from '@/styles/createStyleSheet'


import { topNavCss } from '@/components/organisms/TopNav/css'

injectStyleSheet('account-layout-template-css', `
.account-shell {
  min-height: 100vh;
}

.top-nav--account {
  position: sticky;
  top: 0;
  z-index: 20;
}

.top-nav--account .top-nav__actions {
  margin-left: auto;
}

.account-page {
  max-width: 820px;
  margin: 0 auto;
  padding: 32px 24px 72px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.account-loading {
  padding: 72px 24px;
  text-align: center;
  color: var(--text-secondary);
}

.account-card {
  padding: 28px;
}

.account-card__label {
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.account-card h1 {
  margin: 8px 0;
  font-size: clamp(28px, 4vw, 40px);
  letter-spacing: -1.2px;
}

.account-card h2 {
  margin: 0 0 6px;
  font-size: 18px;
}

.account-card__description {
  margin: 0 0 20px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.account-card__actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.account-card__feedback {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.account-card__feedback--error {
  color: var(--danger);
}

@media (max-width: 560px) {
  .account-page {
    padding: 24px 18px 40px;
  }

  .account-card {
    padding: 22px;
  }
}
`)

export const accountLayoutCss = {
  shell: 'account-shell',
  topNav: `${topNavCss.topNav} top-nav--account`,
  topNavLogo: topNavCss.topNavLogo,
  navTabs: topNavCss.topNavTabs,
  topNavActions: topNavCss.topNavActions,
  themeToggle: topNavCss.themeToggle,
  page: 'account-page',
  loading: 'account-loading',
  // blocos reaproveitados pelas páginas de conta (perfil, configurações)
  card: 'account-card panel',
  cardLabel: 'account-card__label',
  cardDescription: 'account-card__description',
  cardActions: 'account-card__actions',
  feedback: 'account-card__feedback',
  feedbackError: 'account-card__feedback account-card__feedback--error',
} as const
