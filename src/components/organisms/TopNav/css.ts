import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('top-nav-organism-css', `
.top-nav {
  position: relative;
  height: 64px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 0 24px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
}

.top-nav__logo {
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 4px;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  text-decoration: none;
  cursor: pointer;
}

.top-nav__tabs {
  display: flex;
  gap: 24px;
  flex: 1;
  justify-content: center;
}

.top-nav__tab {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  padding: 8px 2px;
  border-bottom: 2px solid transparent;
}

.top-nav__tab.active {
  color: var(--accent-purple);
  border-bottom-color: var(--accent-purple);
  font-weight: 600;
}

.top-nav__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.theme-toggle {
  background: none;
  border: none;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.top-nav__avatar {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--text-secondary);
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--accent-gradient);
  color: white;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top-nav__mobile-toggle {
  display: none;
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
}

.top-nav__mobile-toggle:hover {
  border-color: var(--accent-purple);
  color: var(--accent-purple);
}

.top-nav__mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px;
  background: var(--bg-panel);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 16px 32px rgba(17, 13, 31, .14);
}

.top-nav__mobile-menu a {
  padding: 12px 14px;
  border-radius: 9px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
}

.top-nav__mobile-menu a:hover {
  background: var(--bg-panel-alt);
}

.top-nav__mobile-menu a.top-nav__mobile-link--active {
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-weight: 700;
}

@media (max-width: 900px) {
  .top-nav__tabs {
    display: none;
  }

  .top-nav__mobile-toggle {
    display: inline-flex;
    /* as abas (que tinham flex:1 e empurravam tudo pra direita)
       somem nesse breakpoint — sem isso, o hambúrguer e as ações
       ficam grudados no logo em vez de irem pro canto direito */
    margin-left: auto;
  }
}

@media (max-width: 560px) {
  .top-nav {
    padding: 0 18px;
    gap: 16px;
  }
}
`)

export const topNavCss = {
  topNav: 'top-nav',
  topNavLogo: 'top-nav__logo',
  topNavTabs: 'top-nav__tabs',
  topNavTab: 'top-nav__tab',
  topNavTabActive: 'top-nav__tab active',
  topNavActions: 'top-nav__actions',
  themeToggle: 'theme-toggle',
  topNavAvatar: 'top-nav__avatar',
  avatarCircle: 'avatar-circle',
  mobileMenuButton: 'top-nav__mobile-toggle',
  mobileMenu: 'top-nav__mobile-menu',
  mobileMenuLink: '',
  mobileMenuLinkActive: 'top-nav__mobile-link--active',
} as const
