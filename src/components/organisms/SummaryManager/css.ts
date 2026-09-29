import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('summary-manager-css', `
.summary-manager{display:grid;gap:22px}
.summary-manager__intro{display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
.summary-manager__tag{margin:0 0 7px;display:flex;align-items:center;gap:6px;color:var(--accent-purple);font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
.summary-manager__title{margin:0 0 6px;font-size:18px}
.summary-manager__description{margin:0;color:var(--text-secondary);font-size:13px;max-width:560px}
.summary-manager__build{display:flex;align-items:center;gap:8px;height:42px;padding:0 16px;border:1px solid var(--accent-purple);border-radius:11px;background:var(--accent-purple);color:#fff;font-size:12px;font-weight:700;white-space:nowrap}

.summary-manager__section-label{margin:0 0 12px;color:var(--text-secondary);font-size:11px;font-weight:800;text-transform:uppercase}
.summary-manager__presets{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:14px;margin-bottom:26px}
.summary-preset-wrap{position:relative;display:flex}
.summary-preset-card{width:100%;overflow:hidden;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg-panel);text-align:left;cursor:pointer}
.summary-preset-card:hover{border-color:var(--accent-purple)}
.summary-preset-card--active{border-color:var(--accent-purple);box-shadow:0 0 0 1px var(--accent-purple)}
.summary-preset-card__preview{height:150px;overflow:hidden;padding:14px;background:var(--bg-panel-alt);color:var(--text-primary);pointer-events:none}
/* miniatura em escala reduzida, pra caber o modelo inteiro (título, partes e capítulos) */
.summary-preset-card__preview>*{zoom:.62;height:calc(100% / .62)!important}
.summary-preset-card__body{padding:11px 13px;border-top:1px solid var(--border)}
.summary-preset-card__body strong{display:block;font-size:12px;margin-bottom:2px}
.summary-preset-card__body span{font-size:10px;color:var(--text-secondary)}
/* canetinha: abre o editor já com este modelo */
.summary-preset-edit{position:absolute;top:8px;right:8px;width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--border);border-radius:50%;background:var(--bg-panel);color:var(--text-secondary);box-shadow:0 4px 12px rgba(25,20,40,.12)}
.summary-preset-edit:hover{border-color:var(--accent-purple);background:var(--accent-purple);color:#fff}

.summary-manager__current{display:grid;grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:24px}
.summary-manager__preview-col{display:grid;gap:10px;justify-items:start}
.summary-manager__preview-label{margin:0;color:var(--text-secondary);font-size:11px;font-weight:800;text-transform:uppercase}
.summary-page-preview{width:100%;max-width:280px;aspect-ratio:148/210;overflow:hidden;border-radius:10px;background:#fffdf8;color:#211f1b;box-shadow:0 14px 35px rgba(25,20,40,.16);padding:11%}
/* a folha da prévia tem ~metade da largura de uma A5 real, então o
   conteúdo vai em meia escala — tamanhos e espaçamentos em proporção */
.summary-page-preview>*{zoom:.5;height:200%!important}
.summary-manager__meta{display:grid;gap:10px;align-content:start}
.summary-manager__meta p{margin:0;color:var(--text-secondary);font-size:12px;line-height:1.6}
.summary-manager__hint{margin:0;color:var(--text-secondary);font-size:11px}
.summary-manager__edit-current{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid var(--accent-purple);border-radius:9px;background:var(--accent-purple-soft);color:var(--accent-purple);font-size:12px;font-weight:700;width:fit-content}
.summary-manager__remove{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid var(--border);border-radius:9px;background:transparent;color:var(--danger);font-size:12px;width:fit-content}
.summary-manager__remove:hover{border-color:var(--danger);background:rgba(220,38,38,.08)}

.summary-editor-overlay{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:22px;background:rgba(19,17,26,.54);backdrop-filter:blur(5px)}
.summary-editor{width:min(980px,100%);max-height:calc(100vh - 44px);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;border:1px solid var(--border);border-radius:20px;background:var(--bg-panel);box-shadow:0 24px 80px rgba(17,13,31,.24)}
.summary-editor__header{display:flex;justify-content:space-between;padding:20px 22px;border-bottom:1px solid var(--border)}
.summary-editor__eyebrow{margin:0 0 4px;color:var(--accent-purple);font-size:11px;font-weight:800;text-transform:uppercase}
.summary-editor__header h2{margin:0;font-size:20px}
.summary-editor__header p{margin:5px 0 0;color:var(--text-secondary);font-size:12px}
.summary-editor__close{width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:10px;background:var(--bg-panel-alt);color:var(--text-secondary)}
.summary-editor__content{min-height:0;overflow:auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,300px)}
.summary-editor__controls{padding:20px;border-right:1px solid var(--border);display:grid;gap:18px;align-content:start}
.summary-editor__section h3{margin:0 0 10px;font-size:12px}
.summary-editor__field{display:flex;flex-direction:column;gap:6px;margin-bottom:12px;color:var(--text-secondary);font-size:11px;font-weight:600}
.summary-editor__field input,.summary-editor__field select,.summary-editor__field textarea{height:38px;padding:0 11px;border:1px solid var(--border-strong);border-radius:9px;background:var(--bg-panel);color:var(--text-primary);font-family:inherit}
.summary-editor__field textarea{height:auto;padding:9px 11px;resize:vertical}
.summary-editor__options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px}
.summary-editor__option{min-height:40px;padding:8px 10px;border:1px solid var(--border);border-radius:9px;background:var(--bg-panel-alt);color:var(--text-secondary);font-size:11px}
.summary-editor__option--active{border-color:var(--accent-purple);background:var(--accent-purple-soft);color:var(--accent-purple);font-weight:700}
.summary-editor__toggles{display:flex;flex-wrap:wrap;gap:8px}
.summary-editor__part{padding:12px;margin-bottom:10px;border:1px solid var(--border);border-radius:11px;background:var(--bg-panel-alt)}
.summary-editor__part-label{display:flex;align-items:center;gap:6px;margin:0 0 10px;font-size:11px;font-weight:800;color:var(--text-primary)}
.summary-editor__part--active{border-color:var(--accent-purple);box-shadow:0 0 0 1px var(--accent-purple)}
.summary-editor__part .summary-editor__toggles{margin-bottom:10px}
.summary-editor__section-hint{margin:-4px 0 12px;color:var(--text-secondary);font-size:11px}
/* trechos clicáveis da prévia do editor, com canetinha no hover */
.summary-editable-part{position:relative;cursor:pointer;border-radius:3px;outline:3px dashed transparent;outline-offset:5px;transition:outline-color .15s}
.summary-editable-part:hover,.summary-editable-part--active{outline-color:var(--accent-purple)}
.summary-editable-part:hover::after{content:'✎';position:absolute;top:-22px;right:-18px;width:40px;height:40px;display:grid;place-items:center;border-radius:50%;background:var(--accent-purple);color:#fff;font:600 26px/1 Inter,sans-serif;font-style:normal;z-index:1}
.summary-editor__part-row{display:grid;grid-template-columns:minmax(0,1fr) 110px;gap:8px}
.summary-editor__part .summary-editor__option{min-height:32px}
.summary-editor__spacing-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 10px}
.summary-editor__preview-area{position:sticky;top:0;align-self:start;display:grid;place-items:center;align-content:start;gap:14px;padding:26px;background:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px),var(--bg-panel-alt);background-size:18px 18px}
.summary-editor__preview-area>p{justify-self:start;margin:0;color:var(--text-secondary);font-size:11px;font-weight:800;text-transform:uppercase}
.summary-editor__footer{display:flex;justify-content:flex-end;gap:8px;padding:14px 22px;border-top:1px solid var(--border)}
.summary-editor__footer button{height:38px;padding:0 14px;border-radius:9px;font-size:12px;font-weight:700}
.summary-editor__cancel{border:1px solid var(--border);background:var(--bg-panel-alt);color:var(--text-secondary)}
.summary-editor__save{border:1px solid var(--accent-purple);background:var(--accent-purple);color:#fff}

@media(max-width:820px){.summary-editor__preview-area{position:static}.summary-editor__spacing-grid{grid-template-columns:1fr}.summary-manager__current{grid-template-columns:1fr}.summary-editor__content{grid-template-columns:1fr}.summary-editor__controls{border-right:0}.summary-editor__options{grid-template-columns:1fr}}
`)

export const summaryManagerCss = {
  root: 'summary-manager',
  intro: 'summary-manager__intro',
  tag: 'summary-manager__tag',
  title: 'summary-manager__title',
  description: 'summary-manager__description',
  build: 'summary-manager__build',
  sectionLabel: 'summary-manager__section-label',
  presets: 'summary-manager__presets',
  presetWrap: 'summary-preset-wrap',
  presetEdit: 'summary-preset-edit',
  presetCard: 'summary-preset-card',
  presetCardActive: 'summary-preset-card summary-preset-card--active',
  presetPreview: 'summary-preset-card__preview',
  presetBody: 'summary-preset-card__body',
  current: 'summary-manager__current',
  previewCol: 'summary-manager__preview-col',
  previewLabel: 'summary-manager__preview-label',
  pagePreview: 'summary-page-preview',
  meta: 'summary-manager__meta',
  hint: 'summary-manager__hint',
  editCurrent: 'summary-manager__edit-current',
  remove: 'summary-manager__remove',
  overlay: 'summary-editor-overlay',
  editor: 'summary-editor',
  header: 'summary-editor__header',
  eyebrow: 'summary-editor__eyebrow',
  close: 'summary-editor__close',
  content: 'summary-editor__content',
  controls: 'summary-editor__controls',
  section: 'summary-editor__section',
  sectionHint: 'summary-editor__section-hint',
  field: 'summary-editor__field',
  options: 'summary-editor__options',
  option: 'summary-editor__option',
  optionActive: 'summary-editor__option summary-editor__option--active',
  toggles: 'summary-editor__toggles',
  part: 'summary-editor__part',
  partActive: 'summary-editor__part summary-editor__part--active',
  partLabel: 'summary-editor__part-label',
  partRow: 'summary-editor__part-row',
  spacingGrid: 'summary-editor__spacing-grid',
  previewArea: 'summary-editor__preview-area',
  footer: 'summary-editor__footer',
  cancel: 'summary-editor__cancel',
  save: 'summary-editor__save',
} as const
