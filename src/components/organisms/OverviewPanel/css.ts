import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('overview-panel-organism-css', `
.overview-panel__label {
  font-size: 12px;
  color: var(--text-secondary);
  margin: 16px 0 8px;
}

.overview-panel__label:first-child {
  margin-top: 0;
}

.overview-panel__stats li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 13px;
}

.overview-panel__stat-name {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-primary);
}

.overview-panel__stat-value {
  color: var(--text-secondary);
}

.overview-panel__today-words {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
}

.overview-panel__streak {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 0;
}

.overview-panel__stats li { border-radius: 7px; padding-left: 5px; padding-right: 5px; }
.overview-panel__stats li:hover { background: var(--bg-panel-alt); }

.overview-panel__insights { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.overview-panel__insight { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 8px; border-radius: var(--radius-sm); background: var(--bg-panel-alt); }
.overview-panel__insight span { flex: 1; }
.overview-panel__insight--warn svg { color: var(--warn); }
.overview-panel__insight--info svg { color: var(--info); }
.overview-panel__insight--danger svg { color: var(--danger); }
.overview-panel__insight-arrow { opacity: 0.4; }
.overview-panel__progress { height: 5px; margin-top: 14px; overflow: hidden; border-radius: 999px; background: var(--bg-panel-alt); }
.overview-panel__progress span { display: block; height: 100%; border-radius: inherit; background: var(--accent-purple); transition: width .25s ease; }
.overview-panel__goal { margin: 6px 0 0; color: var(--text-secondary); font-size: 10px; }
`)

export const overviewPanelCss = {
  panel: 'panel',
  overviewPanel: 'overview-panel',
  overviewPanelLabel: 'overview-panel__label',
  overviewPanelStats: 'overview-panel__stats',
  overviewPanelStatName: 'overview-panel__stat-name',
  overviewPanelStatValue: 'overview-panel__stat-value',
  overviewPanelInsights: 'overview-panel__insights',
  insightByTone: {
    warn: 'overview-panel__insight overview-panel__insight--warn',
    info: 'overview-panel__insight overview-panel__insight--info',
    danger: 'overview-panel__insight overview-panel__insight--danger',
  },
  insightArrow: 'overview-panel__insight-arrow',
  overviewPanelTodayWords: 'overview-panel__today-words',
  overviewPanelStreak: 'overview-panel__streak',
  progress: 'overview-panel__progress',
  goal: 'overview-panel__goal',
} as const
