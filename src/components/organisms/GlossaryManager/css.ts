import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('glossary-manager-css', `
.glossary-manager{display:grid;gap:18px}
.glossary-manager__intro{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.glossary-manager__tag{margin:0 0 7px;display:flex;align-items:center;gap:6px;color:var(--accent-purple);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
.glossary-manager__title{margin:0 0 6px;font-size:18px}
.glossary-manager__description{margin:0;color:var(--text-secondary);font-size:13px;max-width:600px;line-height:1.55}
.glossary-manager__add{display:flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:1px solid var(--accent-purple);border-radius:11px;background:var(--accent-purple);color:#fff;font-size:12px;font-weight:700;white-space:nowrap}
.glossary-manager__add:disabled{opacity:.55;cursor:not-allowed}

.glossary-manager__error{display:flex;align-items:flex-start;gap:8px;margin:0;padding:9px 11px;border:1px solid var(--danger);border-radius:10px;background:rgba(220,38,38,.08);color:var(--danger);font-size:12px}
.glossary-manager__error button{margin-left:auto;display:grid;place-items:center;padding:2px;border:0;background:transparent;color:inherit}

.glossary-manager__form-card{display:grid;gap:4px;padding:16px;border:1px solid var(--accent-purple);border-radius:var(--radius-lg);background:var(--bg-panel)}
.glossary-manager__field{display:flex;flex-direction:column;gap:6px;margin-bottom:10px;color:var(--text-secondary);font-size:11px;font-weight:600}
.glossary-manager__field input,.glossary-manager__field textarea{padding:9px 11px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel);color:var(--text-primary);font-family:inherit;font-size:13px}
.glossary-manager__field textarea{resize:vertical;line-height:1.5}
.glossary-manager__form-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:8px}
.glossary-manager__form-actions button{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 13px;border-radius:9px;font-size:12px;font-weight:700}
.glossary-manager__form-actions button:disabled{opacity:.55;cursor:not-allowed}
.glossary-manager__secondary{border:1px solid var(--border);background:var(--bg-panel-alt);color:var(--text-secondary)}
.glossary-manager__primary{border:1px solid var(--accent-purple);background:var(--accent-purple);color:#fff}

.glossary-manager__toolbar{display:flex;align-items:center;gap:12px}
.glossary-manager__search{flex:1;max-width:360px;display:flex;align-items:center;gap:8px;height:38px;padding:0 11px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel);color:var(--text-secondary)}
.glossary-manager__search input{flex:1;min-width:0;border:0;outline:none;background:transparent;color:var(--text-primary);font-family:inherit;font-size:13px}
.glossary-manager__count{color:var(--text-secondary);font-size:12px}
.glossary-manager__empty{margin:0;padding:24px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);color:var(--text-secondary);font-size:13px;text-align:center}

.glossary-manager__list{display:grid;gap:8px}
.glossary-manager__item{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg-panel)}
.glossary-manager__item:hover{border-color:var(--border-strong)}
.glossary-manager__item-text{flex:1;min-width:0}
.glossary-manager__item-text strong{display:block;margin-bottom:3px;font-size:14px;color:var(--text-primary)}
.glossary-manager__item-text p{margin:0;color:var(--text-secondary);font-size:13px;line-height:1.5}
.glossary-manager__muted{font-style:italic;opacity:.7}
.glossary-manager__pending{display:inline-flex;align-items:center;gap:6px;color:var(--accent-purple);font-size:12px}
.glossary-manager__spinner{animation:glossary-manager-spin .8s linear infinite}@keyframes glossary-manager-spin{to{transform:rotate(360deg)}}
.glossary-manager__failed{display:inline-flex;align-items:center;flex-wrap:wrap;gap:8px;color:var(--danger);font-size:12px}
.glossary-manager__failed button{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border:1px solid currentColor;border-radius:7px;background:transparent;color:inherit;font-size:11px}
.glossary-manager__item-actions{flex:0 0 auto;display:flex;gap:2px}
.glossary-manager__item-actions button{display:grid;place-items:center;width:30px;height:30px;padding:0;border:0;border-radius:8px;background:transparent;color:var(--text-secondary)}
.glossary-manager__item-actions button:hover:not(:disabled){background:var(--bg-panel-alt);color:var(--accent-purple)}
.glossary-manager__item-actions button:disabled{opacity:.4;cursor:not-allowed}
.glossary-manager__item-actions .glossary-manager__danger:hover:not(:disabled){color:var(--danger)}
.glossary-manager__edit-form{flex:1;display:grid;gap:2px}
`)

export const glossaryManagerCss = {
  root: 'glossary-manager',
  intro: 'glossary-manager__intro',
  tag: 'glossary-manager__tag',
  title: 'glossary-manager__title',
  description: 'glossary-manager__description',
  addButton: 'glossary-manager__add',
  error: 'glossary-manager__error',
  formCard: 'glossary-manager__form-card',
  field: 'glossary-manager__field',
  formActions: 'glossary-manager__form-actions',
  secondary: 'glossary-manager__secondary',
  primary: 'glossary-manager__primary',
  toolbar: 'glossary-manager__toolbar',
  search: 'glossary-manager__search',
  count: 'glossary-manager__count',
  empty: 'glossary-manager__empty',
  list: 'glossary-manager__list',
  item: 'glossary-manager__item',
  itemText: 'glossary-manager__item-text',
  muted: 'glossary-manager__muted',
  pending: 'glossary-manager__pending',
  spinner: 'glossary-manager__spinner',
  failed: 'glossary-manager__failed',
  itemActions: 'glossary-manager__item-actions',
  danger: 'glossary-manager__danger',
  editForm: 'glossary-manager__edit-form',
} as const
