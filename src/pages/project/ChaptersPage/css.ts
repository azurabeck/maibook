import { injectStyleSheet } from '@/styles/createStyleSheet'


injectStyleSheet('chapters-page-css', `
.chapters-page {
  height: 100%;
  display: grid;
  grid-template-columns: 240px 1fr 300px 240px;
  gap: 16px;
}

.chapters-page .panel {
  padding: 16px;
  min-height: 0;
  overflow-y: auto;
}

/* #region Abas mobile (só um bloco por vez) */
/* No desktop essa nav nem aparece, e cada "cell" vira "contents" —
   ou seja, some da árvore de caixas e quem vira item do grid é o
   próprio painel (ChapterListPanel/EditorPanel/...) direto, exatamente
   como antes dessa mudança. */
.chapters-page__mobile-tabs { display: none; }
.chapters-page__cell { display: contents; }

@media (max-width: 1100px) {
  .chapters-page {
    grid-template-columns: 220px 1fr 260px;
  }
}

@media (max-width: 900px) {
  .chapters-page {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chapters-page__mobile-tabs {
    flex: 0 0 auto;
    display: flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg-panel-alt);
    overflow-x: auto;
  }

  .chapters-page__mobile-tab {
    flex: 1 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    white-space: nowrap;
    min-height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: 9px;
    background: transparent;
    color: var(--text-secondary);
    font-size: 12px;
    font-weight: 700;
  }

  .chapters-page__mobile-tab--active {
    background: var(--bg-panel);
    color: var(--accent-purple);
    box-shadow: 0 3px 10px rgba(25, 20, 40, .08);
  }

  /* em telas pequenas, cada bloco vira uma caixa de verdade de novo
     (não mais "contents") — só que escondida, exceto a ativa, que
     ocupa toda a largura e a altura que sobrou da tela */
  .chapters-page__cell {
    display: none;
  }

  .chapters-page__cell--active {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  /* o wrapper cresce (regra acima), mas o painel em si (o filho
     direto) também precisa de flex:1 pra herdar essa altura — no
     desktop isso é automático (grid item com stretch), aqui não */
  .chapters-page__cell--active > .panel {
    flex: 1;
    min-height: 0;
  }
}
/* #endregion */
`)

export const chaptersPageCss = {
  root: 'chapters-page',
  mobileTabs: 'chapters-page__mobile-tabs',
  mobileTab: 'chapters-page__mobile-tab',
  mobileTabActive: 'chapters-page__mobile-tab chapters-page__mobile-tab--active',
  cell: 'chapters-page__cell',
  cellActive: 'chapters-page__cell chapters-page__cell--active',
} as const
