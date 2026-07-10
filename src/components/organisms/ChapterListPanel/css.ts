import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('chapter-list-panel-organism-css', `
.chapter-list__project {
  margin-bottom: 20px;
}

.chapter-list__project-label {
  font-size: 12px;
  color: var(--text-secondary);
  display: block;
  margin-bottom: 4px;
}

.chapter-list__project-name {
  background: none;
  border: none;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  padding: 0;
}

.chapter-list__section-label {
  font-size: 12px;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.chapter-list__items {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 16px;
}

.chapter-list__row {
  position: relative;
  display: flex;
  align-items: center;
}

.chapter-list__item {
  flex: 1;
  display: block;
  width: 100%;
  background: none;
  border: none;
  border-left: 2px solid transparent;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-primary);
  text-align: left;
}

.chapter-list__item:hover {
  background: var(--bg-panel-alt);
}

.chapter-list__item.active {
  background: var(--accent-purple-soft);
  border-left-color: var(--accent-purple);
  color: var(--accent-purple);
  font-weight: 600;
}

.chapter-list__item-menu-trigger {
  background: none;
  border: none;
  color: var(--text-secondary);
  opacity: 0.6;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: var(--radius-sm);
}

.chapter-list__item-menu-trigger:hover {
  opacity: 1;
  background: var(--bg-panel-alt);
}

.chapter-list__menu {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  z-index: 10;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  min-width: 160px;
  padding: 4px;
}

.chapter-list__menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
}

.chapter-list__menu button:hover {
  background: var(--bg-panel-alt);
}

.chapter-list__menu button.danger {
  color: var(--danger);
}

.chapter-list__rename-input {
  flex: 1;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--accent-purple);
  background: var(--bg-panel);
  color: var(--text-primary);
  outline: none;
}

.chapter-list__add {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: var(--accent-purple);
  font-size: 14px;
  font-weight: 600;
  padding: 8px 10px;
}
`)

export const chapterListPanelCss = {
  panel: 'panel',
  chapterList: 'chapter-list',
  chapterListProject: 'chapter-list__project',
  chapterListProjectLabel: 'chapter-list__project-label',
  chapterListProjectName: 'chapter-list__project-name',
  chevron: 'chevron',
  chapterListSectionLabel: 'chapter-list__section-label',
  chapterListItems: 'chapter-list__items',
  chapterListRow: 'chapter-list__row',
  chapterListItem: 'chapter-list__item',
  chapterListItemActive: 'chapter-list__item active',
  chapterListRenameInput: 'chapter-list__rename-input',
  chapterListItemMenuTrigger: 'chapter-list__item-menu-trigger',
  chapterListMenu: 'chapter-list__menu',
  danger: 'danger',
  chapterListAdd: 'chapter-list__add',
} as const
