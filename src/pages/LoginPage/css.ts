import { injectStyleSheet } from '@/styles/createStyleSheet'


import { topNavCss } from '@/components/organisms/TopNav/css'

injectStyleSheet('login-page-css', `
.auth-layout {
  min-height: 100vh;
}

.top-nav--auth {
  position: sticky;
  top: 0;
  z-index: 20;
}

.top-nav--auth .top-nav__logo {
  text-decoration: none;
}

.auth-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 72px 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 56px;
  align-items: center;
}

.auth-copy h1 {
  max-width: 620px;
  margin: 18px 0 16px;
  font-size: clamp(38px, 5vw, 64px);
  line-height: 0.98;
  letter-spacing: -2.5px;
}

.auth-copy p {
  max-width: 540px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 17px;
  line-height: 1.65;
}

.auth-copy__note {
  max-width: 440px;
  margin-top: 28px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
}

.auth-copy__note svg {
  flex-shrink: 0;
  color: var(--accent-purple);
}

.login-card {
  padding: 28px;
  box-shadow: 0 24px 80px rgba(123, 97, 255, 0.12);
}

.login-card__header {
  margin-bottom: 24px;
}

.login-card__header span {
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-card__header h2 {
  margin: 8px 0;
  font-size: 28px;
}

.login-card__header p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.login-card__submit {
  width: 100%;
  margin-top: 8px;
}

.login-card__error {
  color: var(--danger);
  font-size: 13px;
}

@media (max-width: 900px) {
  .auth-page {
    grid-template-columns: 1fr;
    padding-top: 40px;
  }
}

@media (max-width: 560px) {
  .auth-page {
    padding: 32px 18px 40px;
  }

  .auth-copy h1 {
    letter-spacing: -2px;
  }

  .login-card {
    padding: 22px;
  }
}
`)

export const loginPageCss = {
  layout: 'auth-layout',
  page: 'auth-page',
  topNav: `${topNavCss.topNav} top-nav--auth`,
  topNavLogo: topNavCss.topNavLogo,
  topNavActions: topNavCss.topNavActions,
  themeToggle: topNavCss.themeToggle,
  navTab: topNavCss.topNavTab,
  copy: 'auth-copy',
  eyebrow: 'public-hero__eyebrow',
  note: 'auth-copy__note panel',
  card: 'login-card panel',
  cardHeader: 'login-card__header',
  submit: 'login-card__submit',
  error: 'login-card__error',
} as const
