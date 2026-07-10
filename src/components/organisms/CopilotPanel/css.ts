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

.copilot-panel__insights-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.copilot-panel__insights {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.insight {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-panel-alt);
}

.insight span {
  flex: 1;
}

.insight--warn svg {
  color: var(--warn);
}

.insight--info svg {
  color: var(--info);
}

.insight--danger svg {
  color: var(--danger);
}

.insight__arrow {
  opacity: 0.4;
}

.copilot-panel__answer {
  font-size: 13px;
  background: var(--accent-purple-soft);
  padding: 10px;
  border-radius: var(--radius-sm);
  margin-bottom: 12px;
  white-space: pre-wrap;
}

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
`)

export const copilotPanelCss = {
  panel: 'panel',
  copilotPanel: 'copilot-panel',
  copilotPanelTabs: 'copilot-panel__tabs',
  copilotTab: 'copilot-tab',
  copilotTabActive: 'copilot-tab active',
  copilotPanelIntro: 'copilot-panel__intro',
  copilotPanelAvatar: 'copilot-panel__avatar',
  copilotPanelInsightsLabel: 'copilot-panel__insights-label',
  copilotPanelInsights: 'copilot-panel__insights',
  insight: 'insight',
  insightWarn: 'insight insight--warn',
  insightInfo: 'insight insight--info',
  insightDanger: 'insight insight--danger',
  insightByTone: {
    warn: 'insight insight--warn',
    info: 'insight insight--info',
    danger: 'insight insight--danger',
  },
  insightArrow: 'insight__arrow',
  copilotPanelAnswer: 'copilot-panel__answer',
  copilotPanelAsk: 'copilot-panel__ask',
  copilotPanelEmpty: 'copilot-panel__empty',
} as const
