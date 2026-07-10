import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('characters-page-css', `
.characters-page { min-height: 0; display: flex; flex-direction: column; gap: 18px; }
.characters-page__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.characters-page__header h1 { margin: 2px 0 5px; font-size: 22px; }
.characters-page__header > div > p:last-child { max-width: 680px; margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.55; }
.characters-page__eyebrow { margin: 0; color: var(--accent-purple); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.characters-page__tabs { display: flex; align-items: center; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.characters-page__tab { min-height: 34px; padding: 0 13px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--text-secondary); font-size: 12px; }
.characters-page__tab:hover { background: var(--bg-panel-alt); color: var(--text-primary); }
.characters-page__tab--active { border-color: var(--accent-purple); background: var(--accent-purple-soft); color: var(--accent-purple); font-weight: 700; }
.characters-page__workspace { min-height: 620px; display: grid; grid-template-columns: 250px minmax(0, 1fr); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-panel); }
.characters-page__sidebar { min-height: 0; display: flex; flex-direction: column; padding: 16px; border-right: 1px solid var(--border); background: var(--bg-panel-alt); }
.characters-page__sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 13px; }
.characters-page__sidebar-header > div { display: flex; flex-direction: column; gap: 2px; }
.characters-page__sidebar-header strong { font-size: 13px; }
.characters-page__sidebar-header span { color: var(--text-secondary); font-size: 10px; }
.characters-page__search { height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel); color: var(--text-muted); }
.characters-page__search:focus-within { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.characters-page__search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; }
.characters-page__character-list { min-height: 0; display: flex; flex: 1; flex-direction: column; gap: 5px; margin: 12px -4px; padding: 0 4px; overflow-y: auto; }
.characters-page__character { width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--text-secondary); text-align: left; }
.characters-page__character:hover { background: var(--bg-panel); color: var(--text-primary); }
.characters-page__character--active { border-color: var(--border); background: var(--bg-panel); color: var(--text-primary); box-shadow: 0 4px 14px rgba(32, 25, 52, .05); }
.characters-page__avatar, .characters-page__large-avatar { flex: 0 0 auto; display: grid; place-items: center; border-radius: 10px; background: var(--accent-purple-soft); color: var(--accent-purple); font-weight: 800; }
.characters-page__avatar { width: 34px; height: 34px; font-size: 10px; }
.characters-page__large-avatar { width: 52px; height: 52px; border-radius: 14px; font-size: 15px; }
.characters-page__character-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.characters-page__character-info strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.characters-page__character-info small { color: var(--text-muted); font-size: 9px; }
.characters-page__create { display: grid; grid-template-columns: minmax(0, 1fr) 36px; gap: 6px; padding-top: 12px; border-top: 1px solid var(--border); }
.characters-page__create input { min-width: 0; height: 36px; padding: 0 10px; border: 1px solid var(--border); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 11px; }
.characters-page__create input:focus { border-color: var(--accent-purple); }
.characters-page__create button { display: grid; place-items: center; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; }
.characters-page__create button:disabled { opacity: .45; }
.characters-page__content { min-width: 0; padding: 24px; }
.characters-page__character-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.characters-page__identity { display: flex; align-items: center; gap: 13px; }
.characters-page__identity h2 { margin: 3px 0 4px; font-size: 20px; }
.characters-page__analysis-status { display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary); font-size: 10px; }
.characters-page__header-actions { display: flex; align-items: center; gap: 7px; }
.characters-page__delete { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel-alt); color: var(--text-secondary); }
.characters-page__delete:hover { border-color: var(--danger); color: var(--danger); }
.characters-page__analyze, .characters-page__empty-analysis button, .characters-page__run { min-height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; font-size: 11px; font-weight: 700; }
.characters-page__analyze:disabled, .characters-page__run:disabled { opacity: .45; }

.characters-page__aliases { margin-top: 16px; display: grid; gap: 12px; padding: 15px; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-panel-alt); }
.characters-page__alias-intro { display: flex; align-items: flex-start; gap: 10px; }
.characters-page__alias-intro > span { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 10px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.characters-page__alias-intro strong { display: block; margin-bottom: 3px; font-size: 12px; }
.characters-page__alias-intro p { margin: 0; color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.characters-page__alias-editor { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.characters-page__alias-editor input { min-width: 0; height: 38px; padding: 0 11px; border: 1px solid var(--border-strong); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 11px; }
.characters-page__alias-editor input:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.characters-page__alias-editor button { min-height: 38px; padding: 0 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel); color: var(--text-primary); font-size: 11px; font-weight: 700; }
.characters-page__alias-editor button:hover { border-color: var(--accent-purple); color: var(--accent-purple); }
.characters-page__alias-editor button:disabled { opacity: .5; }
.characters-page__alias-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.characters-page__alias-tags span { padding: 5px 8px; border: 1px solid color-mix(in srgb, var(--accent-purple) 25%, var(--border)); border-radius: 999px; background: var(--accent-purple-soft); color: var(--accent-purple); font-size: 9px; font-weight: 700; }

.characters-page__details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
.characters-page__detail-card { min-height: 150px; padding: 17px; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-panel-alt); }
.characters-page__detail-card--wide { grid-column: span 2; min-height: 130px; }
.characters-page__detail-card > p { margin: 0 0 5px; color: var(--accent-purple); font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.characters-page__detail-card h3 { margin: 0 0 12px; font-size: 13px; }
.characters-page__detail-card div { color: var(--text-secondary); font-size: 12px; line-height: 1.65; white-space: pre-line; }
.characters-page__empty-analysis, .characters-page__empty-character, .characters-page__coming-soon { min-height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; text-align: center; }
.characters-page__empty-analysis > span { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 18px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.characters-page__empty-analysis h3, .characters-page__empty-character h3, .characters-page__coming-soon strong { margin: 5px 0 0; font-size: 15px; }
.characters-page__empty-analysis p, .characters-page__empty-character p, .characters-page__coming-soon p { max-width: 430px; margin: 0 0 8px; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.characters-page__empty-character, .characters-page__coming-soon { color: var(--text-secondary); }
.characters-page__coming-soon svg, .characters-page__empty-character svg { color: var(--accent-purple); }
.characters-analysis__overlay { position: fixed; inset: 0; z-index: 110; display: grid; place-items: center; padding: 22px; background: rgba(19, 17, 26, .54); backdrop-filter: blur(5px); }
.characters-analysis__modal { width: min(760px, 100%); max-height: calc(100vh - 44px); overflow: hidden; display: grid; grid-template-rows: auto 1fr auto; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-panel); box-shadow: 0 24px 80px rgba(17, 13, 31, .24); }
.characters-analysis__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
.characters-analysis__header h2 { margin: 3px 0 4px; font-size: 20px; }
.characters-analysis__header > div > p:last-child { margin: 0; color: var(--text-secondary); font-size: 12px; }
.characters-analysis__header > button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-panel-alt); color: var(--text-secondary); }
.characters-analysis__content { overflow-y: auto; padding: 20px 22px; }
.characters-analysis__scopes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.characters-analysis__scope { display: grid; grid-template-columns: 38px 1fr; column-gap: 11px; row-gap: 3px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-panel-alt); color: var(--text-primary); text-align: left; }
.characters-analysis__scope > span { grid-row: span 2; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; background: var(--bg-panel); color: var(--text-secondary); }
.characters-analysis__scope strong { align-self: end; font-size: 12px; }
.characters-analysis__scope small { color: var(--text-secondary); font-size: 10px; line-height: 1.45; }
.characters-analysis__scope--active { border-color: var(--accent-purple); background: var(--accent-purple-soft); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-purple) 12%, transparent); }
.characters-analysis__scope--active > span { color: var(--accent-purple); }
.characters-analysis__chapter { display: flex; flex-direction: column; gap: 7px; margin-top: 16px; color: var(--text-secondary); font-size: 11px; font-weight: 600; }
.characters-analysis__chapter select { height: 40px; padding: 0 11px; border: 1px solid var(--border-strong); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 12px; }
.characters-analysis__includes { display: flex; flex-direction: column; gap: 5px; margin-top: 16px; padding: 13px 14px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-panel-alt); }
.characters-analysis__includes strong { font-size: 11px; }
.characters-analysis__includes span { color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.characters-analysis__error { margin: 13px 0 0; color: var(--danger); font-size: 11px; }
.characters-analysis__footer { display: flex; justify-content: flex-end; gap: 8px; padding: 15px 22px; border-top: 1px solid var(--border); }
.characters-analysis__cancel { min-height: 36px; padding: 0 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel-alt); color: var(--text-secondary); font-size: 11px; font-weight: 700; }
@media (max-width: 850px) { .characters-page__workspace { grid-template-columns: 210px minmax(0,1fr); } }
@media (max-width: 680px) { .characters-page__alias-editor { grid-template-columns: 1fr; } .characters-page__workspace { grid-template-columns: 1fr; } .characters-page__sidebar { max-height: 300px; border-right: 0; border-bottom: 1px solid var(--border); } .characters-page__character-header { align-items: flex-start; flex-direction: column; } .characters-page__details, .characters-analysis__scopes { grid-template-columns: 1fr; } .characters-page__detail-card--wide { grid-column: auto; } }

.character-ai-section{display:grid;gap:22px}.character-ai-section__header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--border)}.character-ai-section__header h2{margin:2px 0 5px;font-size:20px}.character-ai-section__header p{margin:0;color:var(--text-secondary);font-size:12px;line-height:1.5}
.connection-groups{display:grid;gap:18px}.connection-group{display:grid;gap:10px}.connection-group h3,.connection-timeline h3{margin:0;font-size:12px}.connection-group h3 span{margin-left:5px;color:var(--accent-purple);font-size:10px}.connection-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.connection-cards article{padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-panel-alt)}.connection-cards strong{display:block;font-size:13px}.connection-cards small{display:block;margin:3px 0 10px;color:var(--accent-purple);font-size:10px;font-weight:700}.connection-cards p{margin:5px 0 0;color:var(--text-secondary);font-size:10px;line-height:1.5}.connection-current{padding-top:7px;border-top:1px solid var(--border)}
.connection-timeline{display:grid;gap:0;padding:16px;border:1px solid var(--border);border-radius:14px;background:var(--bg-panel-alt)}.connection-timeline h3{margin-bottom:14px}.connection-timeline article{position:relative;display:grid;grid-template-columns:18px 1fr;gap:10px;padding-bottom:16px}.connection-timeline article:not(:last-child)::before{content:'';position:absolute;left:5px;top:10px;bottom:0;width:1px;background:var(--border-strong)}.connection-timeline article>span{position:relative;z-index:1;width:11px;height:11px;margin-top:3px;border:2px solid var(--accent-purple);border-radius:50%;background:var(--bg-panel)}.connection-timeline small{display:block;color:var(--accent-purple);font-size:9px;font-weight:800;text-transform:uppercase}.connection-timeline strong{display:block;margin:3px 0;font-size:11px}.connection-timeline p{margin:0;color:var(--text-secondary);font-size:10px;line-height:1.5}
.chapter-summary-list{display:grid;gap:0}.chapter-summary-list article{display:grid;grid-template-columns:44px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid var(--border)}.chapter-summary-index{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--accent-purple);border-radius:11px;background:var(--accent-purple-soft);color:var(--accent-purple);font-size:10px;font-weight:800}.chapter-summary-list small{color:var(--accent-purple);font-size:10px;font-weight:800;text-transform:uppercase}.chapter-summary-list p{margin:7px 0;color:var(--text-secondary);font-size:12px;line-height:1.65}.chapter-summary-actions{display:flex;flex-wrap:wrap;gap:5px;margin-top:9px}.chapter-summary-actions span{padding:5px 8px;border:1px solid var(--border);border-radius:999px;background:var(--bg-panel-alt);color:var(--text-secondary);font-size:9px}.chapter-summary-list blockquote{margin:10px 0 0;padding:9px 11px;border-left:2px solid var(--accent-purple);background:var(--accent-purple-soft);color:var(--text-secondary);font-size:10px;line-height:1.5}
@media(max-width:680px){.character-ai-section__header{flex-direction:column}.connection-cards{grid-template-columns:1fr}}
`)

export const charactersPageCss = {
  page: 'characters-page', pageHeader: 'characters-page__header', eyebrow: 'characters-page__eyebrow', tabs: 'characters-page__tabs',
  tab: 'characters-page__tab', tabActive: 'characters-page__tab characters-page__tab--active', workspace: 'characters-page__workspace',
  sidebar: 'characters-page__sidebar', sidebarHeader: 'characters-page__sidebar-header', search: 'characters-page__search', characterList: 'characters-page__character-list',
  character: 'characters-page__character', characterActive: 'characters-page__character characters-page__character--active', avatar: 'characters-page__avatar',
  characterInfo: 'characters-page__character-info', createCharacter: 'characters-page__create', content: 'characters-page__content', characterHeader: 'characters-page__character-header',
  characterIdentity: 'characters-page__identity', largeAvatar: 'characters-page__large-avatar', analysisStatus: 'characters-page__analysis-status', headerActions: 'characters-page__header-actions',
  deleteButton: 'characters-page__delete', analyzeButton: 'characters-page__analyze', aliasPanel: 'characters-page__aliases', aliasIntro: 'characters-page__alias-intro', aliasEditor: 'characters-page__alias-editor', aliasTags: 'characters-page__alias-tags', detailGrid: 'characters-page__details', detailCard: 'characters-page__detail-card',
  detailCardWide: 'characters-page__detail-card characters-page__detail-card--wide', emptyAnalysis: 'characters-page__empty-analysis', emptyCharacter: 'characters-page__empty-character',
  comingSoon: 'characters-page__coming-soon', overlay: 'characters-analysis__overlay', modal: 'characters-analysis__modal', modalHeader: 'characters-analysis__header',
  modalContent: 'characters-analysis__content', scopeGrid: 'characters-analysis__scopes', scope: 'characters-analysis__scope', scopeActive: 'characters-analysis__scope characters-analysis__scope--active',
  chapterField: 'characters-analysis__chapter', analysisIncludes: 'characters-analysis__includes', error: 'characters-analysis__error', modalFooter: 'characters-analysis__footer',
  cancelButton: 'characters-analysis__cancel', runButton: 'characters-page__run',
} as const
