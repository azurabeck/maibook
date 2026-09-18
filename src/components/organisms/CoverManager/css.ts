import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('cover-manager-css', `
.cover-manager{display:grid;gap:22px}
.cover-manager__intro{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.cover-manager__tag{margin:0 0 7px;display:flex;align-items:center;gap:6px;color:var(--accent-purple);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
.cover-manager__title{margin:0 0 6px;font-size:18px}
.cover-manager__description{margin:0;color:var(--text-secondary);font-size:13px;max-width:520px}
.cover-manager__build{display:flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:1px solid var(--accent-purple);border-radius:11px;background:var(--accent-purple);color:#fff;font-size:12px;font-weight:700;white-space:nowrap}

.cover-manager__body{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:24px}
.cover-manager__preview-col{display:grid;gap:10px;justify-items:start}
.cover-manager__preview-label{margin:0;color:var(--text-secondary);font-size:11px;font-weight:800;text-transform:uppercase}

.cover-manager__actions{display:grid;gap:14px;align-content:start}
.cover-manager__action-group{display:grid;gap:8px}
.cover-manager__action-group span{font-size:11px;font-weight:700;color:var(--text-secondary)}
.cover-manager__row{display:flex;flex-wrap:wrap;gap:8px}
.cover-manager__upload{display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel-alt);color:var(--text-primary);font-size:12px;font-weight:600}
.cover-manager__upload:hover{border-color:var(--accent-purple);color:var(--accent-purple)}
.cover-manager__link-input{flex:1;min-width:180px;height:38px;padding:0 12px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel);color:var(--text-primary);font-size:12px}
.cover-manager__link-button{height:38px;padding:0 14px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel-alt);color:var(--text-primary);font-size:12px;font-weight:600}
.cover-manager__link-button:hover:not(:disabled){border-color:var(--accent-purple);color:var(--accent-purple)}
.cover-manager__link-button:disabled{opacity:.5;cursor:not-allowed}
.cover-manager__remove{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid var(--border);border-radius:9px;background:transparent;color:var(--danger);font-size:12px;width:fit-content}
.cover-manager__remove:hover{border-color:var(--danger);background:rgba(220,38,38,.08)}
.cover-manager__error{margin:0;color:var(--danger);font-size:11px}
.cover-manager__hint{margin:0;color:var(--text-secondary);font-size:11px}

.cover-preview{position:relative;width:100%;max-width:280px;aspect-ratio:148/210;overflow:hidden;border-radius:10px;background-color:#1f2933;background-size:cover;background-position:center;box-shadow:0 14px 35px rgba(25,20,40,.16);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:12%}
.cover-preview__title{margin:0 0 8px;font-size:16px;font-weight:800;line-height:1.25;text-shadow:0 1px 6px rgba(0,0,0,.35);word-break:break-word}
.cover-preview__subtitle{margin:0;font-size:11px;opacity:.88;text-shadow:0 1px 6px rgba(0,0,0,.35);word-break:break-word}
.cover-preview__empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.75);font-size:11px}

.cover-editor-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:22px;background:rgba(19,17,26,.54);backdrop-filter:blur(5px)}
.cover-editor{width:min(960px,100%);max-height:calc(100vh - 44px);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;border:1px solid var(--border);border-radius:20px;background:var(--bg-panel);box-shadow:0 24px 80px rgba(17,13,31,.24)}
.cover-editor__header{display:flex;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--border)}
.cover-editor__eyebrow{margin:0 0 4px;color:var(--accent-purple);font-size:11px;font-weight:800;text-transform:uppercase}
.cover-editor__header h2{margin:0;font-size:20px}
.cover-editor__header p{margin:5px 0 0;color:var(--text-secondary);font-size:12px}
.cover-editor__close{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:10px;background:var(--bg-panel-alt);color:var(--text-secondary)}
.cover-editor__content{min-height:0;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,300px)}
.cover-editor__controls{padding:20px;border-right:1px solid var(--border);display:grid;gap:18px;align-content:start}
.cover-editor__section h3{margin:0 0 10px;font-size:12px}
.cover-editor__field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;color:var(--text-secondary);font-size:11px;font-weight:600}
.cover-editor__field input,.cover-editor__field textarea{height:38px;padding:0 11px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel);color:var(--text-primary);font-family:inherit}
.cover-editor__field textarea{height:auto;padding:9px 11px;resize:vertical}
.cover-editor__two-cols{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.cover-editor__color-field{display:flex;flex-direction:column;gap:6px;color:var(--text-secondary);font-size:11px;font-weight:600}
.cover-editor__color-field input{height:38px;padding:2px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel)}
.cover-editor__preview-area{display:grid;place-items:center;align-content:center;gap:14px;padding:26px;background:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px),var(--bg-panel-alt);background-size:18px 18px}
.cover-editor__preview-area>p{justify-self:start;margin:0;color:var(--text-secondary);font-size:11px;font-weight:800;text-transform:uppercase}
.cover-editor__footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid var(--border)}
.cover-editor__footer button{height:38px;padding:0 14px;border-radius:9px;font-size:12px;font-weight:700}
.cover-editor__cancel{border:1px solid var(--border);background:var(--bg-panel-alt);color:var(--text-secondary)}
.cover-editor__save{border:1px solid var(--accent-purple);background:var(--accent-purple);color:#fff}
.cover-editor__save:disabled{opacity:.6;cursor:not-allowed}

@media(max-width:820px){.cover-manager__body{grid-template-columns:1fr}.cover-editor__content{grid-template-columns:1fr}.cover-editor__controls{border-right:0}}
`)

export const coverManagerCss = {
  root: 'cover-manager',
  intro: 'cover-manager__intro',
  tag: 'cover-manager__tag',
  title: 'cover-manager__title',
  description: 'cover-manager__description',
  build: 'cover-manager__build',
  body: 'cover-manager__body',
  previewCol: 'cover-manager__preview-col',
  previewLabel: 'cover-manager__preview-label',
  actions: 'cover-manager__actions',
  actionGroup: 'cover-manager__action-group',
  row: 'cover-manager__row',
  upload: 'cover-manager__upload',
  linkInput: 'cover-manager__link-input',
  linkButton: 'cover-manager__link-button',
  remove: 'cover-manager__remove',
  error: 'cover-manager__error',
  hint: 'cover-manager__hint',
  preview: 'cover-preview',
  previewTitle: 'cover-preview__title',
  previewSubtitle: 'cover-preview__subtitle',
  previewEmpty: 'cover-preview__empty',
  overlay: 'cover-editor-overlay',
  editor: 'cover-editor',
  header: 'cover-editor__header',
  eyebrow: 'cover-editor__eyebrow',
  close: 'cover-editor__close',
  content: 'cover-editor__content',
  controls: 'cover-editor__controls',
  section: 'cover-editor__section',
  field: 'cover-editor__field',
  twoCols: 'cover-editor__two-cols',
  colorField: 'cover-editor__color-field',
  previewArea: 'cover-editor__preview-area',
  footer: 'cover-editor__footer',
  cancel: 'cover-editor__cancel',
  save: 'cover-editor__save',
} as const
