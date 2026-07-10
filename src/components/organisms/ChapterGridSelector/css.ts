import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('chapter-grid-selector-css', `
.chapter-grid-selector__trigger {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  max-width: 180px;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  padding: 6px 9px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
}
.chapter-grid-selector__trigger span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chapter-grid-selector__trigger:hover { color: var(--text-primary); border-color: var(--text-muted); }
.chapter-grid-selector__overlay { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgba(19,17,26,.54); backdrop-filter: blur(5px); }
.chapter-grid-selector__modal { position: relative; width: min(860px, 100%); max-height: min(760px, calc(100vh - 48px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-panel); box-shadow: 0 24px 80px rgba(17,13,31,.24); }
.chapter-grid-selector__modal::before { content:''; position:absolute; top:0; left:22px; right:22px; height:2px; background:var(--accent-purple); border-radius:0 0 2px 2px; }
.chapter-grid-selector__header { display: flex; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
.chapter-grid-selector__header h2 { margin: 2px 0 5px; font-size: 20px; }
.chapter-grid-selector__header p { margin: 0; color: var(--text-secondary); font-size: 13px; }
.chapter-grid-selector__eyebrow { text-transform: uppercase; letter-spacing: .11em; font-size: 10px !important; font-weight: 700; color: var(--accent-purple) !important; }
.chapter-grid-selector__close { align-self: flex-start; display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-panel-alt); color: var(--text-secondary); cursor: pointer; }
.chapter-grid-selector__content { min-height: 240px; padding: 20px 22px; overflow-y: auto; }
.chapter-grid-selector__list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
.chapter-grid-selector__card { position: relative; display: flex; align-items: center; gap: 13px; width: 100%; padding: 15px; text-align: left; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-panel-alt); color: var(--text-primary); cursor: pointer; }
.chapter-grid-selector__card:hover { border-color: var(--border-strong); transform: translateY(-1px); }
.chapter-grid-selector__card--active { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.chapter-grid-selector__paper-icon { flex: 0 0 auto; display: grid; place-items: center; width: 42px; height: 52px; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--accent-purple-soft); color: var(--accent-purple); box-shadow: 0 4px 12px rgba(0,0,0,.08); }
.chapter-grid-selector__info { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.chapter-grid-selector__info strong { font-size: 13px; }
.chapter-grid-selector__info small { color: var(--text-secondary); font-size: 11px; line-height: 1.35; }
.chapter-grid-selector__check { position: absolute; top: 10px; right: 10px; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--accent-purple); color: white; }
.chapter-grid-selector__empty { min-height: 210px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; text-align: center; color: var(--text-secondary); }
.chapter-grid-selector__empty strong { color: var(--text-primary); }
.chapter-grid-selector__empty span { max-width: 330px; font-size: 13px; }
.chapter-grid-selector__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 22px 20px; border-top: 1px solid var(--border); }
.chapter-grid-selector__footer button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; border-radius: 9px; padding: 0 14px; font-size: 12px; font-weight: 650; cursor: pointer; }
.chapter-grid-selector__footer button:disabled { opacity: .45; cursor: not-allowed; }
.chapter-grid-selector__secondary { border: 1px solid var(--border); background: transparent; color: var(--text-secondary); }
.chapter-grid-selector__secondary-action { border: 1px solid var(--border-strong); background: var(--bg-panel); color: var(--text-primary); }
.chapter-grid-selector__primary { border: 1px solid transparent; background: var(--accent-purple); color: white; }
@media (max-width: 680px) { .chapter-grid-selector__list { grid-template-columns: 1fr; } .chapter-grid-selector__footer { flex-wrap: wrap; } .chapter-grid-selector__footer button { flex: 1 1 auto; } }
`)

export const chapterGridSelectorCss = {
  trigger: 'chapter-grid-selector__trigger', overlay: 'chapter-grid-selector__overlay', modal: 'chapter-grid-selector__modal',
  header: 'chapter-grid-selector__header', eyebrow: 'chapter-grid-selector__eyebrow', close: 'chapter-grid-selector__close',
  content: 'chapter-grid-selector__content', gridList: 'chapter-grid-selector__list', gridCard: 'chapter-grid-selector__card',
  gridCardActive: 'chapter-grid-selector__card chapter-grid-selector__card--active', paperIcon: 'chapter-grid-selector__paper-icon',
  gridInfo: 'chapter-grid-selector__info', check: 'chapter-grid-selector__check', empty: 'chapter-grid-selector__empty',
  footer: 'chapter-grid-selector__footer', secondary: 'chapter-grid-selector__secondary', secondaryAction: 'chapter-grid-selector__secondary-action', primary: 'chapter-grid-selector__primary',
} as const
