import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('locations-page-css', `
.locations-page { min-height: 0; display: flex; flex-direction: column; gap: 18px; }
.locations-page__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 24px; }
.locations-page__header h1 { margin: 2px 0 5px; font-size: 22px; }
.locations-page__header > div > p:last-child { max-width: 680px; margin: 0; color: var(--text-secondary); font-size: 13px; line-height: 1.55; }
.locations-page__eyebrow { margin: 0; color: var(--accent-purple); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.locations-page__world-map { display: grid; gap: 14px; padding: 18px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-panel); }
.locations-page__world-map-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.locations-page__world-map-header h2 { margin: 3px 0 4px; font-size: 16px; }
.locations-page__world-map-header > div > p:last-child { margin: 0; color: var(--text-secondary); font-size: 12px; }
.locations-page__world-map-actions { display: flex; align-items: center; gap: 8px; flex: 0 0 auto; }
.locations-page__world-map-upload { display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 13px; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; font-size: 11px; font-weight: 700; cursor: pointer; white-space: nowrap; }
.locations-page__world-map-remove { flex: 0 0 auto; width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel-alt); color: var(--text-secondary); }
.locations-page__world-map-remove:hover { border-color: var(--danger); color: var(--danger); }
.locations-page__world-map-image { width: 100%; max-height: 260px; object-fit: contain; border-radius: 12px; background: var(--bg-panel-alt); }
.locations-page__world-map-empty { min-height: 140px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; border: 1px dashed var(--border); border-radius: 12px; color: var(--text-secondary); font-size: 12px; }
.locations-page__world-map-empty p { margin: 0; }
.locations-page__world-map-error { margin: 0; color: var(--danger); font-size: 11px; }

.locations-page__tabs { display: flex; align-items: center; gap: 6px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
.locations-page__tab { min-height: 34px; padding: 0 13px; border: 1px solid transparent; border-radius: 9px; background: transparent; color: var(--text-secondary); font-size: 12px; }
.locations-page__tab:hover { background: var(--bg-panel-alt); color: var(--text-primary); }
.locations-page__tab--active { border-color: var(--accent-purple); background: var(--accent-purple-soft); color: var(--accent-purple); font-weight: 700; }
.locations-page__workspace { min-height: 620px; display: grid; grid-template-columns: 250px minmax(0, 1fr); overflow: hidden; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-panel); }
.locations-page__sidebar { min-height: 0; display: flex; flex-direction: column; padding: 16px; border-right: 1px solid var(--border); background: var(--bg-panel-alt); }
.locations-page__sidebar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 13px; }
.locations-page__sidebar-header > div { display: flex; flex-direction: column; gap: 2px; }
.locations-page__sidebar-header strong { font-size: 13px; }
.locations-page__sidebar-header span { color: var(--text-secondary); font-size: 10px; }
.locations-page__search { height: 36px; display: flex; align-items: center; gap: 8px; padding: 0 10px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel); color: var(--text-muted); }
.locations-page__search:focus-within { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.locations-page__search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--text-primary); font: inherit; font-size: 11px; }
.locations-page__location-list { min-height: 0; display: flex; flex: 1; flex-direction: column; gap: 5px; margin: 12px -4px; padding: 0 4px; overflow-y: auto; }
.locations-page__location { width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px; border: 1px solid transparent; border-radius: 10px; background: transparent; color: var(--text-secondary); text-align: left; }
.locations-page__location:hover { background: var(--bg-panel); color: var(--text-primary); }
.locations-page__location--active { border-color: var(--border); background: var(--bg-panel); color: var(--text-primary); box-shadow: 0 4px 14px rgba(32, 25, 52, .05); }
.locations-page__avatar, .locations-page__large-avatar { flex: 0 0 auto; display: grid; place-items: center; overflow: hidden; border-radius: 10px; background: var(--accent-purple-soft); color: var(--accent-purple); font-weight: 800; }
.locations-page__avatar { width: 34px; height: 34px; font-size: 10px; }
.locations-page__large-avatar { width: 52px; height: 52px; border-radius: 14px; font-size: 15px; }
.locations-page__avatar img, .locations-page__large-avatar img { width: 100%; height: 100%; object-fit: cover; }
.locations-page__image-wrap { position: relative; flex: 0 0 auto; }
.locations-page__image-upload { position: absolute; right: -4px; bottom: -4px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 50%; border: 1px solid var(--border); background: var(--bg-panel); color: var(--text-secondary); cursor: pointer; }
.locations-page__image-upload:hover { border-color: var(--accent-purple); color: var(--accent-purple); }
.locations-page__spinner-small { width: 11px; height: 11px; border: 2px solid var(--accent-purple-soft); border-top-color: var(--accent-purple); border-radius: 50%; animation: locations-page-spin .7s linear infinite; }
.locations-page__location-info { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 2px; }
.locations-page__location-info strong { overflow: hidden; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.locations-page__location-info small { color: var(--text-muted); font-size: 9px; }
.locations-page__refresh { flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel); color: var(--text-secondary); }
.locations-page__refresh:hover { border-color: var(--accent-purple); color: var(--accent-purple); }
.locations-page__refresh:disabled { opacity: .5; }
.locations-page__refresh--spinning svg { animation: locations-page-spin .9s linear infinite; }
@keyframes locations-page-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.locations-page__divider { width: 100%; display: flex; align-items: center; gap: 6px; margin: 10px 0 2px; padding: 4px 0; border: 0; background: transparent; color: var(--text-muted); font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; text-align: left; }
.locations-page__divider:hover { color: var(--accent-purple); }
.locations-page__divider svg { flex: 0 0 auto; transition: transform .15s ease; }
.locations-page__divider-chevron-open { transform: rotate(90deg); }
.locations-page__divider span { flex: 0 0 auto; }
.locations-page__divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }
.locations-page__location-pending { width: 100%; display: flex; align-items: center; gap: 9px; padding: 8px; border: 1px dashed var(--border); border-radius: 10px; background: transparent; }
.locations-page__add-detected { flex: 0 0 auto; width: 30px; height: 30px; display: grid; place-items: center; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.locations-page__add-detected:hover { background: var(--accent-purple); color: white; }
.locations-page__add-detected:disabled { opacity: .5; }
.locations-page__detect-error { margin: 8px 0 0; color: var(--danger); font-size: 10px; line-height: 1.4; }
.locations-page__create-label { margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border); color: var(--text-secondary); font-size: 10px; font-weight: 700; letter-spacing: .02em; }
.locations-page__create { display: grid; grid-template-columns: minmax(0, 1fr) 36px; gap: 6px; margin-top: 6px; }
.locations-page__create input { min-width: 0; height: 36px; padding: 0 10px; border: 1px solid var(--border); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 11px; }
.locations-page__create input:focus { border-color: var(--accent-purple); }
.locations-page__create button { display: grid; place-items: center; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; }
.locations-page__create button:disabled { opacity: .45; }
.locations-page__content { min-width: 0; padding: 24px; }
.locations-page__location-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.locations-page__identity { display: flex; align-items: center; gap: 13px; }
.locations-page__identity h2 { margin: 3px 0 4px; font-size: 20px; }
.locations-page__analysis-status { display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary); font-size: 10px; }
.locations-page__header-actions { display: flex; align-items: center; gap: 7px; }
.locations-page__delete { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel-alt); color: var(--text-secondary); }
.locations-page__delete:hover { border-color: var(--danger); color: var(--danger); }
.locations-page__analyze, .locations-page__empty-analysis button, .locations-page__run { min-height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 7px; padding: 0 13px; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; font-size: 11px; font-weight: 700; }
.locations-page__analyze:disabled, .locations-page__run:disabled { opacity: .45; }

.locations-page__aliases { margin-top: 16px; display: grid; gap: 12px; padding: 15px; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-panel-alt); }
.locations-page__alias-intro { display: flex; align-items: flex-start; gap: 10px; }
.locations-page__alias-intro > span { width: 34px; height: 34px; flex: 0 0 34px; display: grid; place-items: center; border-radius: 10px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.locations-page__alias-intro strong { display: block; margin-bottom: 3px; font-size: 12px; }
.locations-page__alias-intro p { margin: 0; color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.locations-page__alias-editor { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
.locations-page__alias-editor input { min-width: 0; height: 38px; padding: 0 11px; border: 1px solid var(--border-strong); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 11px; }
.locations-page__alias-editor input:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.locations-page__alias-editor button { min-height: 38px; padding: 0 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel); color: var(--text-primary); font-size: 11px; font-weight: 700; }
.locations-page__alias-editor button:hover { border-color: var(--accent-purple); color: var(--accent-purple); }
.locations-page__alias-editor button:disabled { opacity: .5; }
.locations-page__alias-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.locations-page__alias-tags span { padding: 5px 8px; border: 1px solid color-mix(in srgb, var(--accent-purple) 25%, var(--border)); border-radius: 999px; background: var(--accent-purple-soft); color: var(--accent-purple); font-size: 9px; font-weight: 700; }

.locations-page__details { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-top: 18px; }
.locations-page__detail-card { min-height: 150px; padding: 17px; border: 1px solid var(--border); border-radius: 13px; background: var(--bg-panel-alt); }
.locations-page__detail-card--wide { grid-column: span 2; min-height: 130px; }
.locations-page__detail-card > p { margin: 0 0 5px; color: var(--accent-purple); font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.locations-page__detail-card h3 { margin: 0 0 12px; font-size: 13px; }
.locations-page__detail-card div { color: var(--text-secondary); font-size: 12px; line-height: 1.65; white-space: pre-line; }
.locations-page__empty-analysis, .locations-page__empty-location, .locations-page__coming-soon { min-height: 440px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; text-align: center; }
.locations-page__empty-analysis > span { width: 58px; height: 58px; display: grid; place-items: center; border-radius: 18px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.locations-page__empty-analysis h3, .locations-page__empty-location h3, .locations-page__coming-soon strong { margin: 5px 0 0; font-size: 15px; }
.locations-page__empty-analysis p, .locations-page__empty-location p, .locations-page__coming-soon p { max-width: 430px; margin: 0 0 8px; color: var(--text-secondary); font-size: 12px; line-height: 1.6; }
.locations-page__empty-location, .locations-page__coming-soon { color: var(--text-secondary); }
.locations-page__coming-soon svg, .locations-page__empty-location svg { color: var(--accent-purple); }
.locations-analysis__overlay { position: fixed; inset: 0; z-index: 110; display: grid; place-items: center; padding: 22px; background: rgba(19, 17, 26, .54); backdrop-filter: blur(5px); }
.locations-analysis__modal { width: min(760px, 100%); max-height: calc(100vh - 44px); overflow: hidden; display: grid; grid-template-rows: auto 1fr auto; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-panel); box-shadow: 0 24px 80px rgba(17, 13, 31, .24); }
.locations-analysis__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
.locations-analysis__header h2 { margin: 3px 0 4px; font-size: 20px; }
.locations-analysis__header > div > p:last-child { margin: 0; color: var(--text-secondary); font-size: 12px; }
.locations-analysis__header > button { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-panel-alt); color: var(--text-secondary); }
.locations-analysis__content { overflow-y: auto; padding: 20px 22px; }
.locations-analysis__scopes { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.locations-analysis__scope { display: grid; grid-template-columns: 38px 1fr; column-gap: 11px; row-gap: 3px; padding: 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-panel-alt); color: var(--text-primary); text-align: left; }
.locations-analysis__scope > span { grid-row: span 2; width: 38px; height: 38px; display: grid; place-items: center; border-radius: 10px; background: var(--bg-panel); color: var(--text-secondary); }
.locations-analysis__scope strong { align-self: end; font-size: 12px; }
.locations-analysis__scope small { color: var(--text-secondary); font-size: 10px; line-height: 1.45; }
.locations-analysis__scope--active { border-color: var(--accent-purple); background: var(--accent-purple-soft); box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-purple) 12%, transparent); }
.locations-analysis__scope--active > span { color: var(--accent-purple); }
.locations-analysis__chapter { display: flex; flex-direction: column; gap: 7px; margin-top: 16px; color: var(--text-secondary); font-size: 11px; font-weight: 600; }
.locations-analysis__chapter select { height: 40px; padding: 0 11px; border: 1px solid var(--border-strong); border-radius: 9px; outline: 0; background: var(--bg-panel); color: var(--text-primary); font: inherit; font-size: 12px; }
.locations-analysis__includes { display: flex; flex-direction: column; gap: 5px; margin-top: 16px; padding: 13px 14px; border: 1px solid var(--border); border-radius: 11px; background: var(--bg-panel-alt); }
.locations-analysis__includes strong { font-size: 11px; }
.locations-analysis__includes span { color: var(--text-secondary); font-size: 10px; line-height: 1.5; }
.locations-analysis__error { margin: 13px 0 0; color: var(--danger); font-size: 11px; }
.locations-analysis__footer { display: flex; justify-content: flex-end; gap: 8px; padding: 15px 22px; border-top: 1px solid var(--border); }
.locations-analysis__cancel { min-height: 36px; padding: 0 13px; border: 1px solid var(--border); border-radius: 9px; background: var(--bg-panel-alt); color: var(--text-secondary); font-size: 11px; font-weight: 700; }
@media (max-width: 850px) { .locations-page__workspace { grid-template-columns: 210px minmax(0,1fr); } }
@media (max-width: 680px) { .locations-page__alias-editor { grid-template-columns: 1fr; } .locations-page__workspace { grid-template-columns: 1fr; } .locations-page__sidebar { max-height: 300px; border-right: 0; border-bottom: 1px solid var(--border); } .locations-page__location-header { align-items: flex-start; flex-direction: column; } .locations-page__details, .locations-analysis__scopes { grid-template-columns: 1fr; } .locations-page__detail-card--wide { grid-column: auto; } }

.location-ai-section{display:grid;gap:22px}.location-ai-section__header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:18px;border-bottom:1px solid var(--border)}.location-ai-section__header h2{margin:2px 0 5px;font-size:20px}.location-ai-section__header p{margin:0;color:var(--text-secondary);font-size:12px;line-height:1.5}
.location-connection-groups{display:grid;gap:18px}.location-connection-group{display:grid;gap:10px}.location-connection-group h3{margin:0;font-size:12px}.location-connection-group h3 span{margin-left:5px;color:var(--accent-purple);font-size:10px}.location-connection-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px}.location-connection-cards article{padding:14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-panel-alt)}.location-connection-cards strong{display:block;font-size:13px}.location-connection-cards small{display:block;margin:3px 0 10px;color:var(--accent-purple);font-size:10px;font-weight:700}.location-connection-cards p{margin:5px 0 0;color:var(--text-secondary);font-size:10px;line-height:1.5}
.location-event-list{display:grid;gap:0}.location-event-list article{display:grid;grid-template-columns:44px 1fr;gap:14px;padding:18px 0;border-bottom:1px solid var(--border)}.location-event-index{display:grid;place-items:center;width:38px;height:38px;border:1px solid var(--accent-purple);border-radius:11px;background:var(--accent-purple-soft);color:var(--accent-purple);font-size:10px;font-weight:800}.location-event-list small{color:var(--accent-purple);font-size:10px;font-weight:800;text-transform:uppercase}.location-event-list h3{margin:4px 0 6px;font-size:13px}.location-event-list p{margin:0;color:var(--text-secondary);font-size:12px;line-height:1.65}
@media(max-width:680px){.location-ai-section__header{flex-direction:column}.location-connection-cards{grid-template-columns:1fr}}
`)

export const locationsPageCss = {
  page: 'locations-page', pageHeader: 'locations-page__header', eyebrow: 'locations-page__eyebrow',
  worldMapCard: 'locations-page__world-map', worldMapHeader: 'locations-page__world-map-header', worldMapActions: 'locations-page__world-map-actions',
  worldMapUploadButton: 'locations-page__world-map-upload', worldMapRemoveButton: 'locations-page__world-map-remove',
  worldMapImage: 'locations-page__world-map-image', worldMapEmpty: 'locations-page__world-map-empty', worldMapError: 'locations-page__world-map-error',
  imageWrap: 'locations-page__image-wrap', imageUpload: 'locations-page__image-upload', spinnerSmall: 'locations-page__spinner-small',
  tabs: 'locations-page__tabs',
  tab: 'locations-page__tab', tabActive: 'locations-page__tab locations-page__tab--active', workspace: 'locations-page__workspace',
  sidebar: 'locations-page__sidebar', sidebarHeader: 'locations-page__sidebar-header', search: 'locations-page__search', locationList: 'locations-page__location-list',
  location: 'locations-page__location', locationActive: 'locations-page__location locations-page__location--active', avatar: 'locations-page__avatar',
  locationInfo: 'locations-page__location-info', createLocationLabel: 'locations-page__create-label', createLocation: 'locations-page__create', content: 'locations-page__content', locationHeader: 'locations-page__location-header',
  refreshButton: 'locations-page__refresh', refreshButtonSpinning: 'locations-page__refresh locations-page__refresh--spinning',
  listDivider: 'locations-page__divider', listDividerChevronOpen: 'locations-page__divider-chevron-open', locationPending: 'locations-page__location-pending', addDetectedButton: 'locations-page__add-detected', detectError: 'locations-page__detect-error',
  locationIdentity: 'locations-page__identity', largeAvatar: 'locations-page__large-avatar', analysisStatus: 'locations-page__analysis-status', headerActions: 'locations-page__header-actions',
  deleteButton: 'locations-page__delete', analyzeButton: 'locations-page__analyze', aliasPanel: 'locations-page__aliases', aliasIntro: 'locations-page__alias-intro', aliasEditor: 'locations-page__alias-editor', aliasTags: 'locations-page__alias-tags', detailGrid: 'locations-page__details', detailCard: 'locations-page__detail-card',
  detailCardWide: 'locations-page__detail-card locations-page__detail-card--wide', emptyAnalysis: 'locations-page__empty-analysis', emptyLocation: 'locations-page__empty-location',
  comingSoon: 'locations-page__coming-soon', overlay: 'locations-analysis__overlay', modal: 'locations-analysis__modal', modalHeader: 'locations-analysis__header',
  modalContent: 'locations-analysis__content', scopeGrid: 'locations-analysis__scopes', scope: 'locations-analysis__scope', scopeActive: 'locations-analysis__scope locations-analysis__scope--active',
  chapterField: 'locations-analysis__chapter', analysisIncludes: 'locations-analysis__includes', error: 'locations-analysis__error', modalFooter: 'locations-analysis__footer',
  cancelButton: 'locations-analysis__cancel', runButton: 'locations-page__run',
} as const
