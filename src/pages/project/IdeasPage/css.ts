import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('ideas-page-css', `
.ideas-page{display:grid;gap:20px}
.ideas-page__header{display:flex;align-items:flex-start;justify-content:space-between;gap:24px}
.ideas-page__header h1{margin:2px 0 6px;font-size:24px}
.ideas-page__header p{margin:0;max-width:720px;color:var(--text-secondary);font-size:13px;line-height:1.6}
.ideas-page__eyebrow{margin:0;color:var(--accent-purple);font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
.ideas-page__tabs{display:flex;gap:6px;padding:5px;border:1px solid var(--border);border-radius:12px;background:var(--bg-panel-alt);width:fit-content}
.ideas-page__tab{padding:9px 13px;border:0;border-radius:8px;background:transparent;color:var(--text-secondary);font-size:11px;font-weight:700}
.ideas-page__tab--active{background:var(--bg-panel);color:var(--accent-purple);box-shadow:0 3px 12px rgba(25,20,40,.07)}
.ideas-page__panel{display:grid;gap:22px;padding:22px;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--bg-panel)}

.ideas-page__composer{display:grid;gap:10px;padding:16px;border:1px solid var(--border);border-radius:14px;background:var(--bg-panel-alt)}
.ideas-page__composer textarea{min-height:78px;padding:11px 13px;border:1px solid var(--border-strong);border-radius:11px;outline:0;resize:vertical;background:var(--bg-panel);color:var(--text-primary);font:inherit;font-size:12px;line-height:1.55}
.ideas-page__composer textarea:focus{border-color:var(--accent-purple);box-shadow:0 0 0 2px var(--accent-purple-soft)}
.ideas-page__composer-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.ideas-page__composer-field{min-width:220px;flex:1;height:38px;padding:0 12px;border:1px solid var(--border);border-radius:9px;outline:0;background:var(--bg-panel);color:var(--text-primary);font:inherit;font-size:11px}
.ideas-page__composer-field:focus{border-color:var(--accent-purple)}
.ideas-page__composer-submit{flex:0 0 auto;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 15px;border:1px solid var(--accent-purple);border-radius:9px;background:var(--accent-purple);color:white;font-size:11px;font-weight:800}
.ideas-page__composer-submit:disabled{opacity:.5}

.ideas-page__feed{display:grid;gap:12px}
.ideas-page__empty{min-height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;color:var(--text-secondary)}
.ideas-page__empty span{width:52px;height:52px;display:grid;place-items:center;border-radius:16px;background:var(--accent-purple-soft);color:var(--accent-purple)}
.ideas-page__empty h3{margin:4px 0 0;font-size:14px;color:var(--text-primary)}
.ideas-page__empty p{margin:0;max-width:380px;font-size:12px;line-height:1.6}

.ideas-page__card{display:grid;gap:10px;padding:15px;border:1px solid var(--border);border-radius:13px;background:var(--bg-panel-alt)}
.ideas-page__card-header{display:flex;align-items:center;justify-content:space-between;gap:12px}
.ideas-page__tag{display:inline-flex;align-items:center;padding:4px 10px;border-radius:999px;background:var(--accent-purple-soft);color:var(--accent-purple);font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
.ideas-page__date{display:inline-flex;align-items:center;gap:5px;color:var(--text-muted);font-size:9px}
.ideas-page__content{margin:0;color:var(--text-primary);font-size:12px;line-height:1.65;white-space:pre-wrap}
.ideas-page__card-footer{display:flex;align-items:center;gap:6px}
.ideas-page__action{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel);color:var(--text-secondary);font-size:10px;font-weight:700}
.ideas-page__action:hover{border-color:var(--accent-purple);color:var(--accent-purple)}
.ideas-page__action--danger:hover{border-color:var(--danger);color:var(--danger)}
.ideas-page__action--ai{border-color:var(--accent-purple);background:var(--accent-purple-soft);color:var(--accent-purple)}

.ideas-page__edit{display:grid;gap:10px}
.ideas-page__edit textarea{min-height:78px;padding:11px 13px;border:1px solid var(--accent-purple);border-radius:11px;outline:0;resize:vertical;background:var(--bg-panel);color:var(--text-primary);font:inherit;font-size:12px;line-height:1.55}
.ideas-page__edit-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px}
.ideas-page__edit-actions{display:flex;justify-content:flex-end;gap:8px}
.ideas-page__edit-cancel{height:32px;padding:0 12px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel);color:var(--text-secondary);font-size:10px;font-weight:700}
.ideas-page__edit-save{height:32px;padding:0 12px;border:1px solid var(--accent-purple);border-radius:8px;background:var(--accent-purple);color:white;font-size:10px;font-weight:700}
.ideas-page__edit-save:disabled{opacity:.5}

.ideas-discussion__overlay{position:fixed;inset:0;z-index:110;display:grid;place-items:center;padding:22px;background:rgba(19,17,26,.54);backdrop-filter:blur(5px)}
.ideas-discussion__modal{width:min(620px,100%);max-height:calc(100vh - 44px);overflow:hidden;display:grid;grid-template-rows:auto 1fr auto;border:1px solid var(--border);border-radius:20px;background:var(--bg-panel);box-shadow:0 24px 80px rgba(17,13,31,.24)}
.ideas-discussion__header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding:20px 22px;border-bottom:1px solid var(--border)}
.ideas-discussion__header h2{margin:2px 0 6px;font-size:18px}
.ideas-discussion__header blockquote{margin:0;padding:10px 12px;border-left:2px solid var(--accent-purple);background:var(--accent-purple-soft);color:var(--text-secondary);font-size:11px;line-height:1.5;white-space:pre-wrap}
.ideas-discussion__header>button{flex:0 0 auto;width:34px;height:34px;display:grid;place-items:center;border:1px solid var(--border);border-radius:10px;background:var(--bg-panel-alt);color:var(--text-secondary)}
.ideas-discussion__content{overflow-y:auto;padding:20px 22px;display:grid;gap:12px;align-content:start}
.ideas-discussion__placeholder{display:flex;align-items:flex-start;gap:10px;color:var(--text-secondary);font-size:12px;line-height:1.6}
.ideas-discussion__placeholder span{flex:0 0 auto;width:32px;height:32px;display:grid;place-items:center;border-radius:10px;background:var(--accent-purple-soft);color:var(--accent-purple)}
.ideas-discussion__exchange{display:grid;gap:8px}
.ideas-discussion__bubble-user{justify-self:end;display:flex;align-items:center;gap:6px;max-width:88%;padding:9px 12px;border-radius:12px 12px 2px 12px;background:var(--accent-purple-soft);color:var(--accent-purple);font-size:11px;font-weight:600;line-height:1.5;white-space:pre-wrap}
.ideas-discussion__bubble-ai{justify-self:start;max-width:92%;padding:12px 13px;border:1px solid var(--border);border-radius:12px 12px 12px 2px;background:var(--bg-panel-alt)}
.ideas-discussion__bubble-ai strong{display:flex;align-items:center;gap:5px;margin-bottom:6px;color:var(--accent-purple);font-size:9px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.ideas-discussion__bubble-ai p{margin:0;color:var(--text-primary);font-size:12px;line-height:1.65;white-space:pre-wrap}
.ideas-discussion__answer{padding:13px 14px;border:1px solid var(--border);border-radius:12px;background:var(--bg-panel-alt);color:var(--text-primary);font-size:12px;line-height:1.65;white-space:pre-wrap}
.ideas-discussion__loading{justify-self:start;display:flex;align-items:center;gap:9px;padding:11px 14px;border:1px solid var(--border);border-radius:12px 12px 12px 2px;background:var(--bg-panel-alt);color:var(--text-secondary);font-size:11px}
.ideas-discussion__spinner{flex:0 0 auto;width:14px;height:14px;border:2px solid var(--accent-purple-soft);border-top-color:var(--accent-purple);border-radius:50%;animation:ideas-discussion-spin .7s linear infinite}
.ideas-discussion__spinner-on-solid{flex:0 0 auto;width:15px;height:15px;border:2px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:ideas-discussion-spin .7s linear infinite}
@keyframes ideas-discussion-spin{to{transform:rotate(360deg)}}
.ideas-discussion__error{margin:0;color:var(--danger);font-size:11px}
.ideas-discussion__footer{display:flex;align-items:center;gap:8px;padding:15px 22px;border-top:1px solid var(--border)}
.ideas-discussion__footer input{flex:1;height:40px;padding:0 13px;border:1px solid var(--border-strong);border-radius:9px;outline:0;background:var(--bg-panel);color:var(--text-primary);font:inherit;font-size:12px}
.ideas-discussion__footer input:focus{border-color:var(--accent-purple);box-shadow:0 0 0 2px var(--accent-purple-soft)}
.ideas-discussion__footer button{flex:0 0 auto;width:40px;height:40px;display:grid;place-items:center;border:1px solid var(--accent-purple);border-radius:9px;background:var(--accent-purple);color:white}
.ideas-discussion__footer button:disabled{opacity:.5}

@media(max-width:680px){.ideas-page__header{flex-direction:column}.ideas-page__composer-meta{flex-direction:column;align-items:stretch}.ideas-page__composer-field{width:100%}}
`)

export const ideasPageCss = {
  page: 'ideas-page',
  pageHeader: 'ideas-page__header',
  eyebrow: 'ideas-page__eyebrow',
  tabs: 'ideas-page__tabs',
  tab: 'ideas-page__tab',
  tabActive: 'ideas-page__tab ideas-page__tab--active',
  panel: 'ideas-page__panel',
  composer: 'ideas-page__composer',
  composerMeta: 'ideas-page__composer-meta',
  composerField: 'ideas-page__composer-field',
  composerSubmit: 'ideas-page__composer-submit',
  feed: 'ideas-page__feed',
  empty: 'ideas-page__empty',
  card: 'ideas-page__card',
  cardHeader: 'ideas-page__card-header',
  tag: 'ideas-page__tag',
  date: 'ideas-page__date',
  content: 'ideas-page__content',
  cardFooter: 'ideas-page__card-footer',
  action: 'ideas-page__action',
  actionDanger: 'ideas-page__action ideas-page__action--danger',
  actionAi: 'ideas-page__action ideas-page__action--ai',
  edit: 'ideas-page__edit',
  editMeta: 'ideas-page__edit-meta',
  editActions: 'ideas-page__edit-actions',
  editCancel: 'ideas-page__edit-cancel',
  editSave: 'ideas-page__edit-save',
  discussionOverlay: 'ideas-discussion__overlay',
  discussionModal: 'ideas-discussion__modal',
  discussionHeader: 'ideas-discussion__header',
  discussionContent: 'ideas-discussion__content',
  discussionPlaceholder: 'ideas-discussion__placeholder',
  discussionExchange: 'ideas-discussion__exchange',
  discussionBubbleUser: 'ideas-discussion__bubble-user',
  discussionBubbleAi: 'ideas-discussion__bubble-ai',
  discussionLoading: 'ideas-discussion__loading',
  discussionSpinner: 'ideas-discussion__spinner',
  discussionSpinnerOnSolid: 'ideas-discussion__spinner-on-solid',
  discussionAnswer: 'ideas-discussion__answer',
  discussionError: 'ideas-discussion__error',
  discussionFooter: 'ideas-discussion__footer',
} as const
