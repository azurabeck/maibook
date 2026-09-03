import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('editor-panel-organism-css', `
.editor-panel{display:flex;flex-direction:column;overflow:hidden!important}
.editor-panel--empty{align-items:center;justify-content:center;color:var(--text-secondary)}
.editor-panel__header{display:flex;justify-content:space-between;align-items:center;flex:0 0 auto;padding-bottom:12px;border-bottom:1px solid var(--border)}
.editor-panel__title-row{display:flex;align-items:baseline;gap:10px}.editor-panel__title-row h2{margin:0;font-size:16px}
.editor-panel__saved{font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:4px}.editor-panel__saved .dot{width:6px;height:6px;border-radius:50%;background:#4caf6d}
.editor-panel__header-actions{display:flex;align-items:center;gap:10px;color:var(--text-secondary);font-size:13px}
.editor-panel__toolbar{display:flex;align-items:center;gap:12px;flex:0 0 auto;padding:10px 0;color:var(--text-secondary);border-bottom:1px solid var(--border)}
.toolbar-dropdown{background:none;border:none;color:var(--text-secondary);font-size:13px}.toolbar-divider{width:1px;height:16px;background:var(--border-strong)}.toolbar-quote{font-size:16px;color:var(--text-muted)}
.editor-panel__toolbar-meta{display:flex;align-items:center;gap:12px;margin-left:auto;color:var(--text-secondary)}
.editor-panel__canvas{display:flex;flex:1 1 0;min-height:0;overflow:hidden}
.editor-panel__textarea{display:block;width:100%;height:100%;min-height:0;flex:1;border:none;outline:none;resize:none;overflow-y:auto;background:transparent;color:var(--text-primary);font-size:15px;line-height:1.7;padding:20px 4px;box-sizing:border-box;font-family:inherit}
.editor-panel__footer{flex:0 0 auto;font-size:12px;color:var(--text-secondary);padding-top:8px;border-top:1px solid var(--border)}

/* #region Mobile: ações do cabeçalho viram menu hambúrguer, barra de
   ferramentas some (os botões dela ainda nem aplicam formatação de
   verdade — ver comentário no index.tsx) */
.editor-panel__mobile-menu-toggle{display:none}

@media (max-width: 680px) {
  .editor-panel__header{position:relative;flex-wrap:wrap}

  .editor-panel__mobile-menu-toggle{
    display:inline-flex;align-items:center;justify-content:center;
    width:32px;height:32px;flex:0 0 auto;
    border:1px solid var(--border);border-radius:8px;
    background:var(--bg-panel-alt);color:var(--text-secondary);
  }

  .editor-panel__header-actions{display:none}

  .editor-panel__header-actions--open{
    display:flex;flex-direction:column;align-items:stretch;gap:6px;
    position:absolute;top:100%;right:0;z-index:20;margin-top:8px;min-width:230px;
    padding:8px;background:var(--bg-panel);border:1px solid var(--border);
    border-radius:12px;box-shadow:0 16px 32px rgba(17,13,31,.16);
  }

  .editor-panel__toolbar{display:none}
}
/* #endregion */
`)

export const editorPanelCss = {
  panel:'panel', editorPanel:'editor-panel', editorPanelEmpty:'editor-panel--empty', editorPanelHeader:'editor-panel__header', editorPanelTitleRow:'editor-panel__title-row', editorPanelSaved:'editor-panel__saved', dot:'dot', editorPanelHeaderActions:'editor-panel__header-actions', editorPanelHeaderActionsOpen:'editor-panel__header-actions editor-panel__header-actions--open', mobileMenuToggle:'editor-panel__mobile-menu-toggle', editorPanelWordCount:'editor-panel__word-count', editorPanelToolbar:'editor-panel__toolbar', toolbarDropdown:'toolbar-dropdown', toolbarDivider:'toolbar-divider', toolbarQuote:'toolbar-quote', toolbarMeta:'editor-panel__toolbar-meta', editorCanvas:'editor-panel__canvas', editorCanvasGrid:'editor-panel__canvas', editorPage:'', editorPageGrid:'', gridNotice:'', editorPanelTextarea:'editor-panel__textarea', editorPanelFooter:'editor-panel__footer',
} as const
