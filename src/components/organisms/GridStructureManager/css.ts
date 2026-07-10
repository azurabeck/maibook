import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('grid-structure-manager-css', `
.grid-structure-manager { display: grid; gap: 22px; }
.grid-structure-manager__intro { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
.grid-structure-manager__intro-tag { margin:0 0 7px; display:flex; align-items:center; gap:6px; color:var(--accent-purple); font-size:11px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
.grid-structure-manager__title { margin:0 0 6px; font-size:18px; }
.grid-structure-manager__description { max-width:650px; margin:0; color:var(--text-secondary); font-size:13px; line-height:1.6; }
.grid-structure-manager__add { width:52px; height:52px; flex:0 0 52px; display:grid; place-items:center; border:1px dashed var(--accent-purple); border-radius:14px; background:var(--accent-purple-soft); color:var(--accent-purple); }
.grid-structure-manager__add:hover { transform:translateY(-2px); background:var(--bg-panel); box-shadow:0 10px 24px rgba(123,97,255,.15); }
.grid-structure-manager__error { margin:0; color:var(--danger); font-size:12px; }
.grid-structure-manager__cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:15px; }
.grid-structure-card { overflow:hidden; border:1px solid var(--border); border-radius:var(--radius-lg); background:var(--bg-panel); transition:.18s ease; }
.grid-structure-card:hover { transform:translateY(-2px); border-color:var(--border-strong); box-shadow:0 12px 28px rgba(34,28,58,.08); }
.grid-structure-card__preview { min-height:190px; display:grid; place-items:center; padding:18px; background:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px),var(--bg-panel-alt); background-size:18px 18px; }
.grid-structure-card__body { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 15px; border-top:1px solid var(--border); }
.grid-structure-card__body h3 { margin:0 0 5px; font-size:14px; }
.grid-structure-card__body p { margin:0; color:var(--text-secondary); font-size:10px; }
.grid-structure-card__actions { display:flex; gap:4px; }
.grid-structure-card__actions button { width:30px; height:30px; display:grid; place-items:center; border:0; border-radius:8px; background:transparent; color:var(--text-secondary); }
.grid-structure-card__actions button:hover { background:var(--accent-purple-soft); color:var(--accent-purple); }
.grid-structure-manager__empty { min-height:235px; display:grid; place-items:center; align-content:center; gap:7px; padding:32px; border:1px dashed var(--border-strong); border-radius:var(--radius-lg); background:var(--bg-panel-alt); color:var(--text-secondary); text-align:center; }
.grid-structure-manager__empty svg { color:var(--accent-purple); }
.grid-structure-manager__empty h3,.grid-structure-manager__empty p { margin:0; }
.grid-structure-manager__empty h3 { color:var(--text-primary); font-size:15px; }
.grid-structure-manager__empty p { font-size:13px; }
.grid-editor-overlay { position:fixed; inset:0; z-index:100; display:grid; place-items:center; padding:22px; background:rgba(19,17,26,.54); backdrop-filter:blur(5px); }
.grid-editor { width:min(1180px,100%); max-height:calc(100vh - 44px); overflow:hidden; display:grid; grid-template-rows:auto 1fr auto; border:1px solid var(--border); border-radius:20px; background:var(--bg-panel); box-shadow:0 24px 80px rgba(17,13,31,.24); }
.grid-editor__header { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; padding:20px 22px; border-bottom:1px solid var(--border); }
.grid-editor__eyebrow { margin:0 0 4px; color:var(--accent-purple); font-size:11px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
.grid-editor__title { margin:0; font-size:20px; }
.grid-editor__subtitle { margin:5px 0 0; color:var(--text-secondary); font-size:12px; }
.grid-editor__close { width:34px; height:34px; display:grid; place-items:center; border:1px solid var(--border); border-radius:10px; background:var(--bg-panel-alt); color:var(--text-secondary); }
.grid-editor__content { min-height:0; overflow:auto; display:grid; grid-template-columns:minmax(0,420px) minmax(0,1fr); }
.grid-editor__controls { padding:20px; border-right:1px solid var(--border); }
.grid-editor__section { padding-bottom:20px; margin-bottom:20px; border-bottom:1px solid var(--border); }
.grid-editor__section:last-child { padding:0; margin:0; border:0; }
.grid-editor__section-title { margin:0 0 12px; font-size:12px; }
.grid-editor__field { display:flex; flex-direction:column; gap:6px; margin-bottom:12px; }
.grid-editor__field-label { color:var(--text-secondary); font-size:11px; font-weight:600; }
.grid-editor__input,.grid-editor__select { width:100%; height:38px; padding:0 11px; border:1px solid var(--border-strong); border-radius:9px; background:var(--bg-panel); color:var(--text-primary); font:inherit; font-size:12px; outline:none; }
.grid-editor__input:focus,.grid-editor__select:focus { border-color:var(--accent-purple); box-shadow:0 0 0 3px var(--accent-purple-soft); }
.grid-editor__input-wrap { position:relative; }
.grid-editor__input-wrap .grid-editor__input { padding-right:40px; }
.grid-editor__suffix { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:var(--text-secondary); font-size:9px; }
.grid-editor__format-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; margin-bottom:12px; }
.grid-editor__format { min-height:77px; display:flex; flex-direction:column; align-items:flex-start; gap:3px; padding:10px; border:1px solid var(--border); border-radius:11px; background:var(--bg-panel-alt); color:var(--text-primary); text-align:left; }
.grid-editor__format svg { color:var(--accent-purple); }
.grid-editor__format strong { font-size:11px; }
.grid-editor__format span { color:var(--text-secondary); font-size:8px; }
.grid-editor__format:hover,.grid-editor__format--active { border-color:var(--accent-purple); }
.grid-editor__format--active { background:var(--accent-purple-soft); box-shadow:0 0 0 1px var(--accent-purple); }
.grid-editor__segmented { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); padding:3px; margin-bottom:12px; border-radius:10px; background:var(--bg-panel-alt); }
.grid-editor__segment { height:32px; border:0; border-radius:8px; background:transparent; color:var(--text-secondary); font-size:11px; }
.grid-editor__segment--active { background:var(--bg-panel); color:var(--accent-purple); font-weight:700; box-shadow:0 2px 8px rgba(30,24,54,.08); }
.grid-editor__columns-choice { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-bottom:13px; }
.grid-editor__choice { height:48px; display:flex; align-items:center; justify-content:center; gap:7px; border:1px solid var(--border); border-radius:10px; background:var(--bg-panel-alt); color:var(--text-secondary); font-size:11px; }
.grid-editor__choice--active { border-color:var(--accent-purple); background:var(--accent-purple-soft); color:var(--accent-purple); font-weight:700; }
.grid-editor__field-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 10px; }
.grid-editor__toggles { display:flex; flex-wrap:wrap; gap:7px; }
.grid-editor__toggle { min-height:34px; padding:0 11px; border:1px solid var(--border); border-radius:9px; background:var(--bg-panel-alt); color:var(--text-secondary); font-size:10px; }
.grid-editor__toggle--active { border-color:var(--accent-purple); background:var(--accent-purple-soft); color:var(--accent-purple); font-weight:700; }
.grid-editor__preview-area { min-width:0; padding:28px; display:flex; flex-direction:column; background:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px),var(--bg-panel-alt); background-size:20px 20px; }
.grid-editor__preview-label { margin:0 0 12px; color:var(--text-secondary); font-size:11px; font-weight:800; letter-spacing:.07em; text-transform:uppercase; }
.grid-editor__preview-stage { min-height:560px; display:grid; place-items:center; overflow:auto; }
.grid-preview-paper { box-sizing:border-box; overflow:hidden; background:#fff; color:#252329; border-radius:3px; box-shadow:0 18px 48px rgba(30,24,54,.16); }
.grid-preview-paper__content { width:100%; height:100%; overflow:hidden; }
.grid-preview-paper__content p { orphans:3; widows:3; }
.grid-editor__preview-meta { display:flex; justify-content:center; gap:7px; margin-top:15px; }
.grid-editor__preview-meta span { padding:5px 9px; border:1px solid var(--border); border-radius:999px; background:var(--bg-panel); color:var(--text-secondary); font-size:9px; }
.grid-editor__footer { display:flex; justify-content:flex-end; gap:9px; padding:15px 22px; border-top:1px solid var(--border); }
.grid-editor__secondary-button,.grid-editor__primary-button { height:38px; display:flex; align-items:center; justify-content:center; gap:7px; padding:0 15px; border-radius:10px; font-size:11px; font-weight:700; }
.grid-editor__secondary-button { border:1px solid var(--border); background:var(--bg-panel-alt); color:var(--text-secondary); }
.grid-editor__primary-button { border:1px solid var(--accent-purple); background:var(--accent-purple); color:#fff; }
.grid-editor__primary-button:disabled { opacity:.5; cursor:not-allowed; }
@media (max-width:900px) { .grid-editor__content { grid-template-columns:1fr; } .grid-editor__controls { border-right:0; border-bottom:1px solid var(--border); } .grid-editor__preview-stage { min-height:430px; } }
@media (max-width:560px) { .grid-editor-overlay { padding:0; } .grid-editor { max-height:100vh; height:100vh; border-radius:0; } .grid-editor__format-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .grid-editor__field-grid { grid-template-columns:1fr; } }
`)

export const gridStructureManagerCss = {
  root:'grid-structure-manager', intro:'grid-structure-manager__intro', introTag:'grid-structure-manager__intro-tag', title:'grid-structure-manager__title', description:'grid-structure-manager__description', add:'grid-structure-manager__add', error:'grid-structure-manager__error', cards:'grid-structure-manager__cards', card:'grid-structure-card', cardPreview:'grid-structure-card__preview', cardBody:'grid-structure-card__body', cardActions:'grid-structure-card__actions', empty:'grid-structure-manager__empty', overlay:'grid-editor-overlay', editor:'grid-editor', editorHeader:'grid-editor__header', eyebrow:'grid-editor__eyebrow', editorTitle:'grid-editor__title', editorSubtitle:'grid-editor__subtitle', close:'grid-editor__close', editorContent:'grid-editor__content', controls:'grid-editor__controls', section:'grid-editor__section', sectionTitle:'grid-editor__section-title', field:'grid-editor__field', fieldLabel:'grid-editor__field-label', input:'grid-editor__input', select:'grid-editor__select', inputWrap:'grid-editor__input-wrap', suffix:'grid-editor__suffix', formatGrid:'grid-editor__format-grid', format:'grid-editor__format', formatActive:'grid-editor__format grid-editor__format--active', segmented:'grid-editor__segmented', segment:'grid-editor__segment', segmentActive:'grid-editor__segment grid-editor__segment--active', columnsChoice:'grid-editor__columns-choice', choice:'grid-editor__choice', choiceActive:'grid-editor__choice grid-editor__choice--active', fieldGrid:'grid-editor__field-grid', toggles:'grid-editor__toggles', toggle:'grid-editor__toggle', toggleActive:'grid-editor__toggle grid-editor__toggle--active', previewArea:'grid-editor__preview-area', previewLabel:'grid-editor__preview-label', previewStage:'grid-editor__preview-stage', paper:'grid-preview-paper', paperContent:'grid-preview-paper__content', previewMeta:'grid-editor__preview-meta', footer:'grid-editor__footer', secondaryButton:'grid-editor__secondary-button', primaryButton:'grid-editor__primary-button'
} as const
