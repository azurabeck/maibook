import { injectStyleSheet } from '@/styles/createStyleSheet'


import { topNavCss } from '@/components/organisms/TopNav/css'

injectStyleSheet('dashboard-page-css', `
.dashboard-shell {
  min-height: 100vh;
}

.top-nav--dashboard {
  position: sticky;
  top: 0;
  z-index: 20;
}

.top-nav--dashboard .top-nav__logo {
  text-decoration: none;
}

.dashboard-nav__tabs {
  justify-content: center;
}

.dashboard-page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px 72px;
}

.dashboard-hero {
  padding: 28px;
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: center;
  margin-bottom: 18px;
}

.dashboard-hero__label {
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dashboard-hero h1 {
  margin: 8px 0;
  font-size: clamp(32px, 4vw, 48px);
  letter-spacing: -1.5px;
}

.dashboard-hero p {
  margin: 0;
  color: var(--text-secondary);
}

.dashboard-hero__button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.project-card {
  padding: 20px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
}

.project-card__icon {
  width: 42px;
  height: 42px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-purple);
  background: var(--accent-purple-soft);
  margin-bottom: 18px;
}

.project-card h2 {
  margin: 0 0 8px;
  font-size: 18px;
}

.project-card p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
}

.project-card button {
  margin-top: auto;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--bg-panel-alt);
  color: var(--text-primary);
  font-weight: 600;
}

.dashboard-empty {
  padding: 56px 24px;
  text-align: center;
  color: var(--text-secondary);
}

.dashboard-empty svg {
  color: var(--accent-purple);
}

.dashboard-empty h2 {
  margin: 16px 0 8px;
  color: var(--text-primary);
}

.dashboard-empty p {
  max-width: 440px;
  margin: 0 auto 22px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-hero {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .dashboard-page {
    padding: 32px 18px 40px;
  }

  .dashboard-hero__button {
    width: 100%;
    justify-content: center;
  }

  .dashboard-hero {
    padding: 22px;
  }
}
`)

export const dashboardPageCss = {
  shell: 'dashboard-shell',
  page: 'dashboard-page',
  topNav: `${topNavCss.topNav} top-nav--dashboard`,
  topNavLogo: topNavCss.topNavLogo,
  navTabs: `${topNavCss.topNavTabs} dashboard-nav__tabs`,
  navTab: topNavCss.topNavTab,
  activeTab: topNavCss.topNavTabActive,
  topNavActions: topNavCss.topNavActions,
  themeToggle: topNavCss.themeToggle,
  topNavAvatar: topNavCss.topNavAvatar,
  avatarCircle: topNavCss.avatarCircle,
  hero: 'dashboard-hero panel',
  heroLabel: 'dashboard-hero__label',
  heroButton: 'dashboard-hero__button',
  grid: 'dashboard-grid',
  projectCard: 'project-card panel',
  projectCardIcon: 'project-card__icon',
  empty: 'dashboard-empty panel',
} as const
