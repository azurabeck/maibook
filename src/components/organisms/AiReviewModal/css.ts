import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('ai-review-modal-css', `
.ai-review-modal__trigger { display: inline-flex; align-items: center; gap: 7px; height: 32px; padding: 0 10px; border: 1px solid var(--border); border-radius: 8px; background: transparent; color: var(--text-secondary); font-size: 12px; cursor: pointer; }
.ai-review-modal__trigger:hover { border-color: var(--border-strong); color: var(--text-primary); }
.ai-review-modal__trigger:disabled { opacity: .45; cursor: not-allowed; }
.ai-review-modal__overlay { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 24px; background: rgba(19,17,26,.54); backdrop-filter: blur(5px); }
.ai-review-modal__modal { position: relative; width: min(1080px, 100%); max-height: min(800px, calc(100vh - 48px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-panel); box-shadow: 0 24px 80px rgba(17,13,31,.24); }
.ai-review-modal__modal::before { content:''; position:absolute; top:0; left:22px; right:22px; height:2px; background:var(--accent-purple); border-radius:0 0 2px 2px; }
.ai-review-modal__header { display: flex; justify-content: space-between; gap: 20px; padding: 20px 22px; border-bottom: 1px solid var(--border); }
.ai-review-modal__header h2 { margin: 2px 0 5px; font-size: 20px; }
.ai-review-modal__header p { margin: 0; color: var(--text-secondary); font-size: 13px; }
.ai-review-modal__eyebrow { text-transform: uppercase; letter-spacing: .11em; font-size: 10px !important; font-weight: 700; color: var(--accent-purple) !important; }
.ai-review-modal__close { align-self: flex-start; display: grid; place-items: center; width: 34px; height: 34px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-panel-alt); color: var(--text-secondary); cursor: pointer; }
.ai-review-modal__content { min-height: 320px; padding: 20px 22px; overflow-y: auto; }
.ai-review-modal__columns { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; }
.ai-review-modal__column-title { margin: 0 0 10px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: .06em; }
.ai-review-modal__text { padding: 14px 16px; border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-panel-alt); color: var(--text-primary); font-size: 13px; line-height: 1.7; white-space: pre-wrap; }
.ai-review-modal__removed { text-decoration: line-through; color: var(--text-secondary); background: rgba(220,38,38,.14); border-radius: 3px; }
.ai-review-modal__removed--applied { text-decoration: line-through; color: var(--text-muted); background: transparent; }
.ai-review-modal__added-wrap { display: inline-flex; align-items: center; gap: 4px; background: rgba(22,163,74,.14); border-radius: 3px; padding: 0 2px; }
.ai-review-modal__added-wrap--applied { background: transparent; }
.ai-review-modal__added { color: var(--text-primary); }
.ai-review-modal__apply-btn { display: inline-grid; place-items: center; width: 18px; height: 18px; flex: 0 0 auto; border: none; border-radius: 50%; background: var(--accent-purple); color: #fff; cursor: pointer; }
.ai-review-modal__apply-btn:hover { filter: brightness(1.1); }
.ai-review-modal__apply-btn--applied { background: var(--accent-purple-soft); color: var(--accent-purple); cursor: default; }
.ai-review-modal__state { min-height: 280px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; text-align: center; color: var(--text-secondary); }
.ai-review-modal__state strong { color: var(--text-primary); font-size: 14px; }
.ai-review-modal__state span { max-width: 380px; font-size: 13px; }
.ai-review-modal__spinner { width: 28px; height: 28px; border-radius: 50%; border: 3px solid var(--border); border-top-color: var(--accent-purple); animation: ai-review-modal-spin .8s linear infinite; }
@keyframes ai-review-modal-spin { to { transform: rotate(360deg); } }
.ai-review-modal__footer { display: flex; justify-content: flex-end; gap: 10px; padding: 16px 22px 20px; border-top: 1px solid var(--border); }
.ai-review-modal__footer button { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 38px; border-radius: 9px; padding: 0 14px; font-size: 12px; font-weight: 650; cursor: pointer; }
.ai-review-modal__footer button:disabled { opacity: .45; cursor: not-allowed; }
.ai-review-modal__secondary { border: 1px solid var(--border); background: transparent; color: var(--text-secondary); }
.ai-review-modal__secondary-action { border: 1px solid var(--border-strong); background: var(--bg-panel); color: var(--text-primary); }
.ai-review-modal__primary { border: 1px solid transparent; background: var(--accent-purple); color: white; }
@media (max-width: 780px) { .ai-review-modal__columns { grid-template-columns: 1fr; } .ai-review-modal__footer { flex-wrap: wrap; } .ai-review-modal__footer button { flex: 1 1 auto; } }
`)

export const aiReviewModalCss = {
  trigger: 'ai-review-modal__trigger', overlay: 'ai-review-modal__overlay', modal: 'ai-review-modal__modal',
  header: 'ai-review-modal__header', eyebrow: 'ai-review-modal__eyebrow', close: 'ai-review-modal__close',
  content: 'ai-review-modal__content', columns: 'ai-review-modal__columns', columnTitle: 'ai-review-modal__column-title',
  text: 'ai-review-modal__text', removed: 'ai-review-modal__removed', removedApplied: 'ai-review-modal__removed ai-review-modal__removed--applied',
  addedWrap: 'ai-review-modal__added-wrap', addedWrapApplied: 'ai-review-modal__added-wrap ai-review-modal__added-wrap--applied',
  added: 'ai-review-modal__added', applyBtn: 'ai-review-modal__apply-btn', applyBtnApplied: 'ai-review-modal__apply-btn ai-review-modal__apply-btn--applied',
  state: 'ai-review-modal__state', spinner: 'ai-review-modal__spinner',
  footer: 'ai-review-modal__footer', secondary: 'ai-review-modal__secondary',
  secondaryAction: 'ai-review-modal__secondary-action', primary: 'ai-review-modal__primary',
} as const
