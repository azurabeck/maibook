import { injectStyleSheet } from '@/styles/createStyleSheet'


import { topNavCss } from '@/components/organisms/TopNav/css'

injectStyleSheet('user-menu-organism-css', `
.user-menu {
  position: relative;
  display: flex;
}

.user-menu__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 40;
  min-width: 220px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-shadow: 0 16px 32px rgba(17, 13, 31, .14);
}

.user-menu__identity {
  padding: 8px 12px 12px;
  margin-bottom: 6px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-menu__identity strong {
  font-size: 14px;
  color: var(--text-primary);
}

.user-menu__identity span {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-menu__item {
  width: 100%;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 9px;
  background: none;
  color: var(--text-primary);
  font-size: 14px;
  text-align: left;
  text-decoration: none;
}

.user-menu__item:hover {
  background: var(--bg-panel-alt);
}

.user-menu__item svg {
  color: var(--text-secondary);
}

.user-menu__item--danger,
.user-menu__item--danger svg {
  color: var(--danger);
}
`)

export const userMenuCss = {
  root: 'user-menu',
  trigger: topNavCss.topNavAvatar,
  dropdown: 'user-menu__dropdown panel',
  identity: 'user-menu__identity',
  item: 'user-menu__item',
  itemDanger: 'user-menu__item user-menu__item--danger',
} as const
