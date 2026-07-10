import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('header-structure-manager-css', `
.header-structure-manager {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.header-structure-manager__intro {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.header-structure-manager__title {
  margin: 0 0 6px;
  font-size: 18px;
  font-weight: 700;
}

.header-structure-manager__description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.header-structure-manager__add {
  width: 52px;
  height: 52px;
  flex: 0 0 52px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--accent-purple);
  border-radius: 14px;
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
}

.header-structure-manager__add:hover {
  transform: translateY(-2px);
  background: var(--bg-panel);
  box-shadow: 0 10px 24px rgba(123, 97, 255, 0.15);
}

.header-structure-manager__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.header-structure-manager__empty {
  min-height: 230px;
  display: grid;
  place-items: center;
  padding: 32px;
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  background: var(--bg-panel-alt);
  text-align: center;
}

.header-structure-manager__empty-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 14px;
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
}

.header-structure-manager__empty-title {
  margin: 0 0 6px;
  font-size: 15px;
}

.header-structure-manager__empty-text {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}

.header-structure-card {
  overflow: hidden;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.header-structure-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-strong);
  box-shadow: 0 12px 28px rgba(34, 28, 58, 0.08);
}

.header-structure-card__preview {
  min-height: 150px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-panel-alt);
  border-bottom: 1px solid var(--border);
}

.header-structure-card__body {
  padding: 14px 15px;
}

.header-structure-card__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.header-structure-card__name {
  margin: 0;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-structure-card__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-structure-card__action {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
}

.header-structure-card__action:hover {
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
}

.header-structure-card__action--danger:hover {
  background: rgba(239, 91, 91, 0.1);
  color: var(--danger);
}

.header-structure-card__meta {
  margin: 8px 0 0;
  color: var(--text-secondary);
  font-size: 11px;
}

.header-editor-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 22px;
  background: rgba(19, 17, 26, 0.52);
  backdrop-filter: blur(5px);
}

.header-editor {
  width: min(1120px, 100%);
  max-height: calc(100vh - 44px);
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr auto;
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: 0 24px 80px rgba(17, 13, 31, 0.24);
}

.header-editor__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 22px;
  border-bottom: 1px solid var(--border);
}

.header-editor__eyebrow {
  margin: 0 0 4px;
  color: var(--accent-purple);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-editor__title {
  margin: 0;
  font-size: 20px;
}

.header-editor__subtitle {
  margin: 5px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.header-editor__close {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
}

.header-editor__content {
  min-height: 0;
  overflow: auto;
  display: grid;
  grid-template-columns: minmax(0, 390px) minmax(0, 1fr);
}

.header-editor__controls {
  padding: 20px;
  border-right: 1px solid var(--border);
}

.header-editor__preview-area {
  min-width: 0;
  padding: 28px;
  display: flex;
  flex-direction: column;
  background:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px),
    var(--bg-panel-alt);
  background-size: 20px 20px;
}

.header-editor__preview-label {
  margin: 0 0 12px;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.header-editor__preview-paper {
  width: min(100%, 620px);
  min-height: 310px;
  margin: auto;
  padding: 34px 42px;
  display: flex;
  align-items: flex-start;
  background: #ffffff;
  color: #1c1b1f;
  border-radius: 4px;
  box-shadow: 0 18px 48px rgba(30, 24, 54, 0.14);
}

.header-editor__section {
  padding: 0 0 20px;
  margin: 0 0 20px;
  border-bottom: 1px solid var(--border);
}

.header-editor__section:last-child {
  padding-bottom: 0;
  margin-bottom: 0;
  border-bottom: 0;
}

.header-editor__section-title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
}

.header-editor__layout-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
}

.header-layout-option {
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-panel-alt);
  color: var(--text-primary);
  text-align: left;
}

.header-layout-option:hover {
  border-color: var(--accent-purple);
}

.header-layout-option--active {
  border-color: var(--accent-purple);
  background: var(--accent-purple-soft);
  box-shadow: 0 0 0 1px var(--accent-purple);
}

.header-layout-option__diagram {
  height: 52px;
  margin-bottom: 8px;
  display: grid;
  gap: 4px;
  padding: 7px;
  border-radius: 8px;
  background: var(--bg-panel);
}

.header-layout-option__row {
  border-radius: 3px;
  background: var(--border-strong);
}

.header-layout-option__row--image {
  background: linear-gradient(135deg, var(--accent-purple-soft), rgba(238, 95, 176, 0.18));
}

.header-layout-option__title {
  display: block;
  margin-bottom: 2px;
  font-size: 11px;
  font-weight: 700;
}

.header-layout-option__description {
  display: block;
  color: var(--text-secondary);
  font-size: 9px;
  line-height: 1.35;
}

.header-editor__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.header-editor__field:last-child {
  margin-bottom: 0;
}

.header-editor__field-label {
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 600;
}

.header-editor__input,
.header-editor__select,
.header-editor__textarea {
  width: 100%;
  border: 1px solid var(--border-strong);
  border-radius: 9px;
  background: var(--bg-panel);
  color: var(--text-primary);
  font: inherit;
  font-size: 12px;
  outline: none;
}

.header-editor__input,
.header-editor__select {
  height: 38px;
  padding: 0 11px;
}

.header-editor__textarea {
  min-height: 68px;
  resize: vertical;
  padding: 10px 11px;
}

.header-editor__input:focus,
.header-editor__select:focus,
.header-editor__textarea:focus {
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px var(--accent-purple-soft);
}

.header-editor__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.header-editor__range-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.header-editor__range-value {
  color: var(--accent-purple);
  font-size: 10px;
  font-weight: 700;
}

.header-editor__range {
  width: 100%;
  accent-color: var(--accent-purple);
}

.header-editor__toggles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.header-editor__toggle {
  min-height: 40px;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
}

.header-editor__toggle--active {
  border-color: var(--accent-purple);
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
}

.header-editor__footer {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  border-top: 1px solid var(--border);
}

.header-editor__button {
  min-width: 104px;
  height: 40px;
  padding: 0 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
}

.header-editor__button--secondary {
  border: 1px solid var(--border-strong);
  background: var(--bg-panel);
  color: var(--text-secondary);
}

.header-editor__button--primary {
  border: 0;
  background: var(--accent-gradient);
  color: #ffffff;
  box-shadow: 0 8px 20px rgba(123, 97, 255, 0.22);
}

.header-editor__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.header-preview {
  width: 100%;
  display: flex;
  flex-direction: column;
  color: #1c1b1f;
}

.header-preview__image {
  width: 100%;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 3px;
  background: linear-gradient(135deg, #eee9ff, #fdebf5);
}

.header-preview__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-preview__image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #7b61ff;
  font-size: 10px;
}

.header-preview__text {
  margin: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.header-structure-manager__error {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(239, 91, 91, 0.09);
  color: var(--danger);
  font-size: 12px;
}

@media (max-width: 820px) {
  .header-editor__content {
    grid-template-columns: 1fr;
  }

  .header-editor__controls {
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }

  .header-editor__preview-area {
    min-height: 420px;
  }
}

@media (max-width: 560px) {
  .header-structure-manager__intro {
    align-items: center;
  }

  .header-editor-overlay {
    padding: 0;
  }

  .header-editor {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .header-editor__row,
  .header-editor__layout-grid,
  .header-editor__toggles {
    grid-template-columns: 1fr;
  }

  .header-editor__preview-paper {
    padding: 26px 24px;
  }
}

.header-structure-alignment-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.header-structure-alignment-button {
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--line, #d8d3ca);
  border-radius: 10px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;
}

.header-structure-alignment-button:hover,
.header-structure-alignment-button.is-active {
  border-color: var(--ink, #25231f);
  background: rgba(37, 35, 31, 0.08);
}
`)

export const headerStructureManagerCss = {
  root: 'header-structure-manager',
  intro: 'header-structure-manager__intro',
  title: 'header-structure-manager__title',
  description: 'header-structure-manager__description',
  add: 'header-structure-manager__add',
  grid: 'header-structure-manager__grid',
  empty: 'header-structure-manager__empty',
  emptyIcon: 'header-structure-manager__empty-icon',
  emptyTitle: 'header-structure-manager__empty-title',
  emptyText: 'header-structure-manager__empty-text',
  error: 'header-structure-manager__error',
  card: 'header-structure-card',
  cardPreview: 'header-structure-card__preview',
  cardBody: 'header-structure-card__body',
  cardHeading: 'header-structure-card__heading',
  cardName: 'header-structure-card__name',
  cardActions: 'header-structure-card__actions',
  cardAction: 'header-structure-card__action',
  cardActionDanger: 'header-structure-card__action header-structure-card__action--danger',
  cardMeta: 'header-structure-card__meta',
  overlay: 'header-editor-overlay',
  editor: 'header-editor',
  editorHeader: 'header-editor__header',
  editorEyebrow: 'header-editor__eyebrow',
  editorTitle: 'header-editor__title',
  editorSubtitle: 'header-editor__subtitle',
  editorClose: 'header-editor__close',
  editorContent: 'header-editor__content',
  controls: 'header-editor__controls',
  previewArea: 'header-editor__preview-area',
  previewLabel: 'header-editor__preview-label',
  previewPaper: 'header-editor__preview-paper',
  section: 'header-editor__section',
  sectionTitle: 'header-editor__section-title',
  layoutGrid: 'header-editor__layout-grid',
  layoutOption: 'header-layout-option',
  layoutOptionActive: 'header-layout-option header-layout-option--active',
  layoutDiagram: 'header-layout-option__diagram',
  layoutDiagramRow: 'header-layout-option__row',
  layoutDiagramImage: 'header-layout-option__row header-layout-option__row--image',
  layoutTitle: 'header-layout-option__title',
  layoutDescription: 'header-layout-option__description',
  field: 'header-editor__field',
  fieldLabel: 'header-editor__field-label',
  input: 'header-editor__input',
  select: 'header-editor__select',
  textarea: 'header-editor__textarea',
  row: 'header-editor__row',
  rangeHead: 'header-editor__range-head',
  rangeValue: 'header-editor__range-value',
  range: 'header-editor__range',
  toggles: 'header-editor__toggles',
  toggle: 'header-editor__toggle',
  toggleActive: 'header-editor__toggle header-editor__toggle--active',
  footer: 'header-editor__footer',
  secondaryButton: 'header-editor__button header-editor__button--secondary',
  primaryButton: 'header-editor__button header-editor__button--primary',
  preview: 'header-preview',
  previewImage: 'header-preview__image',
  previewImagePlaceholder: 'header-preview__image-placeholder',
  previewText: 'header-preview__text',
} as const
