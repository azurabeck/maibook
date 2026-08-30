import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('copilot-panel-organism-css', `
.copilot-panel {
  display: flex;
  flex-direction: column;
}

.copilot-panel__tabs {
  display: flex;
  gap: 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}

.copilot-tab {
  background: none;
  border: none;
  padding: 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
  border-bottom: 2px solid transparent;
}

.copilot-tab.active {
  color: var(--accent-purple);
  border-bottom-color: var(--accent-purple);
  font-weight: 600;
}

.copilot-panel__intro {
  display: flex;
  gap: 10px;
  background: var(--bg-panel-alt);
  border-radius: var(--radius-md);
  padding: 12px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 16px;
}

.copilot-panel__avatar {
  font-size: 20px;
}

.copilot-panel__conversation {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.copilot-panel__exchange { display: grid; gap: 6px; }
.copilot-panel__bubble-user { justify-self: end; display: flex; align-items: center; gap: 6px; max-width: 88%; padding: 8px 11px; border-radius: 12px 12px 2px 12px; background: var(--accent-purple-soft); color: var(--accent-purple); font-size: 12px; font-weight: 600; line-height: 1.5; white-space: pre-wrap; }
.copilot-panel__bubble-ai { justify-self: start; max-width: 94%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px 12px 12px 2px; background: var(--bg-panel-alt); }
.copilot-panel__bubble-ai strong { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; color: var(--accent-purple); font-size: 9px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; }
.copilot-panel__bubble-ai p { margin: 0; color: var(--text-primary); font-size: 13px; line-height: 1.55; white-space: pre-wrap; }
.copilot-panel__loading { justify-self: start; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--border); border-radius: 12px 12px 12px 2px; background: var(--bg-panel-alt); color: var(--text-secondary); font-size: 12px; }
.copilot-panel__spinner, .copilot-panel__spinner-on-solid { flex: 0 0 auto; width: 13px; height: 13px; border: 2px solid var(--accent-purple-soft); border-top-color: var(--accent-purple); border-radius: 50%; animation: copilot-panel-spin .7s linear infinite; }
.copilot-panel__spinner-on-solid { width: 14px; height: 14px; border-color: rgba(255, 255, 255, .35); border-top-color: #fff; }
@keyframes copilot-panel-spin { to { transform: rotate(360deg); } }
.copilot-panel__ask-error { margin: 0; color: var(--danger); font-size: 11px; }

.copilot-panel__ask {
  margin-top: auto;
  display: flex;
  gap: 8px;
  align-items: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 6px 6px 6px 14px;
}

.copilot-panel__ask input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
}

.copilot-panel__ask button {
  background: var(--accent-purple);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.copilot-panel__empty {
  color: var(--text-secondary);
  font-size: 13px;
}

.copilot-panel__intro p { margin: 0; line-height: 1.45; }
.copilot-panel__avatar { width: 28px; height: 28px; flex: 0 0 28px; display: grid; place-items: center; border-radius: 9px; background: var(--accent-purple-soft); color: var(--accent-purple); }
.copilot-panel__ask button:disabled { opacity: .45; cursor: not-allowed; }
.copilot-panel__notes { min-height: 0; flex: 1; display: flex; flex-direction: column; gap: 10px; }
.copilot-panel__notes-header strong { display: block; font-size: 13px; }
.copilot-panel__notes-header span { display: block; margin-top: 3px; color: var(--text-secondary); font-size: 11px; }
.copilot-panel__notes textarea { flex: 1; min-height: 220px; resize: none; padding: 11px; border: 1px solid var(--border); border-radius: 10px; background: var(--bg-panel-alt); color: var(--text-primary); font: inherit; font-size: 12px; line-height: 1.55; outline: none; }
.copilot-panel__notes textarea:focus { border-color: var(--accent-purple); box-shadow: 0 0 0 2px var(--accent-purple-soft); }
.copilot-panel__notes > button { align-self: flex-end; display: inline-flex; align-items: center; gap: 6px; min-height: 34px; padding: 0 12px; border: 1px solid var(--accent-purple); border-radius: 9px; background: var(--accent-purple); color: white; font-size: 11px; font-weight: 700; }
`)

export const copilotPanelCss = {
  panel: 'panel',
  copilotPanel: 'copilot-panel',
  copilotPanelTabs: 'copilot-panel__tabs',
  copilotTab: 'copilot-tab',
  copilotTabActive: 'copilot-tab active',
  copilotPanelIntro: 'copilot-panel__intro',
  copilotPanelAvatar: 'copilot-panel__avatar',
  copilotConversation: 'copilot-panel__conversation',
  exchange: 'copilot-panel__exchange',
  bubbleUser: 'copilot-panel__bubble-user',
  bubbleAi: 'copilot-panel__bubble-ai',
  loadingBubble: 'copilot-panel__loading',
  spinner: 'copilot-panel__spinner',
  spinnerOnSolid: 'copilot-panel__spinner-on-solid',
  askError: 'copilot-panel__ask-error',
  copilotPanelAsk: 'copilot-panel__ask',
  copilotPanelEmpty: 'copilot-panel__empty',
  notes: 'copilot-panel__notes',
  notesHeader: 'copilot-panel__notes-header',
} as const
