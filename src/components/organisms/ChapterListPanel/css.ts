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

.chapter-list__project-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chapter-list__project-name {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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


.chapter-list__row {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.chapter-list__row--dragging {
  opacity: 0.42;
}

.chapter-list__row--drop-before::before,
.chapter-list__row--drop-after::after {
  content: '';
  position: absolute;
  left: 4px;
  right: 4px;
  height: 2px;
  border-radius: 999px;
  background: var(--accent-purple);
  box-shadow: 0 0 0 3px var(--accent-purple-soft);
  pointer-events: none;
}

.chapter-list__row--drop-before::before {
  top: -2px;
}

.chapter-list__row--drop-after::after {
  bottom: -2px;
}

.chapter-list__drag-handle {
  flex: 0 0 auto;
  width: 24px;
  min-height: 32px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: grab;
  opacity: 0.5;
}

.chapter-list__row:hover .chapter-list__drag-handle,
.chapter-list__drag-handle:focus-visible {
  opacity: 1;
  color: var(--accent-purple);
  background: var(--accent-purple-soft);
}

.chapter-list__drag-handle:active {
  cursor: grabbing;
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
  width: 100%;
}

.chapter-list__new-chapter {
  position: relative;
}

.chapter-list__new-chapter-menu {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
  display: flex;
  flex-direction: column;
  padding: 4px;
}

.chapter-list__new-chapter-menu button {
  display: flex;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  text-align: left;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-primary);
}

.chapter-list__new-chapter-menu button:hover {
  background: var(--bg-panel-alt);
}

.chapter-list__new-chapter-menu button svg {
  flex: 0 0 auto;
  color: var(--accent-purple);
}

.chapter-list__new-chapter-menu button span {
  display: flex;
  flex-direction: column;
}

.chapter-list__new-chapter-menu button strong {
  font-size: 13px;
  font-weight: 600;
}

.chapter-list__new-chapter-menu button small {
  font-size: 11px;
  color: var(--text-secondary);
}
`)

export const chapterListPanelCss = {
  panel: 'panel',
  chapterList: 'chapter-list',
  chapterListProject: 'chapter-list__project',
  chapterListProjectLabel: 'chapter-list__project-label',
  chapterListProjectRow: 'chapter-list__project-row',
  chapterListProjectName: 'chapter-list__project-name',
  chapterListSectionLabel: 'chapter-list__section-label',
  chapterListItems: 'chapter-list__items',
  chapterListRow: 'chapter-list__row',
  chapterListRowDragging: 'chapter-list__row--dragging',
  chapterListRowDropBefore: 'chapter-list__row--drop-before',
  chapterListRowDropAfter: 'chapter-list__row--drop-after',
  chapterListDragHandle: 'chapter-list__drag-handle',
  chapterListItem: 'chapter-list__item',
  chapterListItemActive: 'chapter-list__item active',
  chapterListRenameInput: 'chapter-list__rename-input',
  chapterListItemMenuTrigger: 'chapter-list__item-menu-trigger',
  chapterListMenu: 'chapter-list__menu',
  danger: 'danger',
  chapterListAdd: 'chapter-list__add',
  chapterListNewChapter: 'chapter-list__new-chapter',
  chapterListNewChapterMenu: 'chapter-list__new-chapter-menu',
} as const
