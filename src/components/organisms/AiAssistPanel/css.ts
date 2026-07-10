import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('ai-assist-panel-organism-css', `
.ai-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-alt);
  border: 1px solid var(--border);
}

.ai-panel .btn {
  width: 100%;
  justify-content: center;
}

.ai-panel__error {
  margin: 0;
  color: var(--danger);
  font-size: 13px;
  line-height: 1.5;
}

.ai-panel__result {
  padding: 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-panel);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

.ai-panel__result p {
  margin: 0;
}
`)

export const aiAssistPanelCss = {
  aiPanel: 'ai-panel',
  aiPanelError: 'ai-panel__error',
  aiPanelResult: 'ai-panel__result',
} as const
