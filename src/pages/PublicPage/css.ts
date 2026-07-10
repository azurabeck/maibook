import { injectStyleSheet } from '@/styles/createStyleSheet'


import { buttonCss } from '@/components/atoms/Button/css'
import { topNavCss } from '@/components/organisms/TopNav/css'

injectStyleSheet('public-page-css', `
.public-page {
  min-height: 100vh;
  overflow-x: hidden;
}

.top-nav--public {
  position: sticky;
  top: 0;
  z-index: 20;
}

.top-nav--public .top-nav__logo {
  text-decoration: none;
}

.public-nav__tabs {
  justify-content: center;
}

.public-nav__login {
  text-decoration: none;
  padding: 8px 14px;
}

.public-hero {
  max-width: 1120px;
  min-height: calc(100vh - 64px - 180px);
  margin: 0 auto;
  padding: 72px 24px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 460px);
  align-items: center;
  gap: 56px;
}

.public-hero__content {
  max-width: 620px;
}

.public-hero__eyebrow {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-size: 13px;
  font-weight: 700;
}

.public-hero h1 {
  margin: 18px 0 16px;
  font-size: clamp(42px, 6vw, 72px);
  line-height: 0.95;
  letter-spacing: -3px;
}

.public-hero__content p {
  max-width: 560px;
  margin: 0;
  color: var(--text-secondary);
  font-size: 18px;
  line-height: 1.65;
}

.public-hero__buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 28px;
}

.public-hero__buttons a {
  text-decoration: none;
}

.public-hero__secondary {
  display: inline-flex;
  align-items: center;
}

.public-preview {
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(123, 97, 255, 0.18);
}

.public-preview::before {
  content: '';
  position: absolute;
  inset: -80px -80px auto auto;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: var(--accent-gradient);
  opacity: 0.18;
  filter: blur(8px);
}

.public-preview__header {
  display: flex;
  gap: 8px;
  padding: 18px;
  border-bottom: 1px solid var(--border);
}

.public-preview__header span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--border-strong);
}

.public-preview__body {
  display: grid;
  grid-template-columns: 130px 1fr;
  min-height: 310px;
}

.public-preview aside {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  border-right: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 13px;
}

.public-preview aside strong {
  margin-bottom: 8px;
  color: var(--text-primary);
}

.public-preview aside span {
  padding: 8px;
  border-radius: var(--radius-sm);
}

.public-preview aside .active {
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-weight: 700;
}

.public-preview article {
  padding: 28px;
}

.public-preview small {
  color: var(--text-secondary);
  font-weight: 700;
}

.public-preview h2 {
  margin: 12px 0;
  font-size: 24px;
}

.public-preview p {
  color: var(--text-secondary);
  line-height: 1.7;
}

.public-features {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 24px 18px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.public-feature {
  padding: 22px;
}

.public-feature svg {
  color: var(--accent-purple);
}

.public-feature h2 {
  margin: 14px 0 8px;
  font-size: 18px;
}

.public-feature p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.public-dashboard-preview {
  max-width: 1120px;
  margin: 0 auto 72px;
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: center;
}

.public-dashboard-preview__label {
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.public-dashboard-preview h2 {
  margin: 8px 0;
  font-size: 32px;
  letter-spacing: -1px;
}

.public-dashboard-preview p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.65;
}

.public-dashboard-preview__cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.public-dashboard-preview__cards span {
  padding: 12px 14px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-alt);
  border: 1px solid var(--border);
  color: var(--text-secondary);
}

@media (max-width: 900px) {
  .public-hero,
  .public-dashboard-preview {
    grid-template-columns: 1fr;
    padding-top: 40px;
  }

  .public-preview {
    max-width: 560px;
  }

  .public-features {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .public-hero {
    padding: 32px 18px 40px;
  }

  .public-hero h1 {
    letter-spacing: -2px;
  }

  .public-hero__buttons {
    align-items: stretch;
    flex-direction: column;
  }

  .public-hero__buttons .btn {
    width: 100%;
    justify-content: center;
  }

  .public-preview__body {
    grid-template-columns: 1fr;
  }

  .public-preview aside {
    border-right: none;
    border-bottom: 1px solid var(--border);
  }

  .public-dashboard-preview {
    padding: 22px;
  }
}
`)

export const publicPageCss = {
  page: 'public-page',
  topNav: `${topNavCss.topNav} top-nav--public`,
  topNavLogo: topNavCss.topNavLogo,
  navTabs: `${topNavCss.topNavTabs} public-nav__tabs`,
  navTab: topNavCss.topNavTab,
  topNavActions: topNavCss.topNavActions,
  themeToggle: topNavCss.themeToggle,
  activeText: 'active',
  loginLink: `${buttonCss.root} ${buttonCss.secondary} public-nav__login`,
  hero: 'public-hero',
  heroContent: 'public-hero__content',
  heroEyebrow: 'public-hero__eyebrow',
  heroButtons: 'public-hero__buttons',
  heroSecondary: `${buttonCss.root} ${buttonCss.secondary} public-hero__secondary`,
  preview: 'public-preview panel',
  previewHeader: 'public-preview__header',
  previewBody: 'public-preview__body',
  features: 'public-features',
  featureCard: 'public-feature panel',
  dashboardPreview: 'public-dashboard-preview panel',
  dashboardPreviewLabel: 'public-dashboard-preview__label',
  dashboardPreviewCards: 'public-dashboard-preview__cards',
} as const
