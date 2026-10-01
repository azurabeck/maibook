import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('settings-page-css', `
.settings-steps {
  margin: 0 0 24px;
  padding: 0;
  list-style: none;
  counter-reset: settings-step;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-steps li {
  counter-increment: settings-step;
  display: flex;
  gap: 12px;
  font-size: 14px;
  line-height: 1.6;
}

.settings-steps li::before {
  content: counter(settings-step);
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-purple-soft);
  color: var(--accent-purple);
  font-size: 12px;
  font-weight: 700;
}

.settings-steps a {
  color: var(--accent-purple);
  font-weight: 600;
}

.settings-status {
  margin-bottom: 20px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-alt);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 14px;
}

.settings-status svg {
  flex-shrink: 0;
  color: var(--accent-purple);
}

.settings-key {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}

.settings-key .form-field {
  flex: 1;
}

.settings-key__toggle {
  height: 35px;
  margin-bottom: 12px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-strong);
  border-radius: var(--radius-sm);
  background: var(--bg-panel-alt);
  color: var(--text-secondary);
}
`)

export const settingsPageCss = {
  steps: 'settings-steps',
  status: 'settings-status',
  key: 'settings-key',
  keyToggle: 'settings-key__toggle',
} as const
