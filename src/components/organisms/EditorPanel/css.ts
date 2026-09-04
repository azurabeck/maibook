import { injectStyleSheet } from '@/styles/createStyleSheet'

injectStyleSheet('editor-panel-organism-css', `
.editor-panel{display:flex;flex-direction:column;overflow:hidden!important}
.editor-panel--empty{align-items:center;justify-content:center;color:var(--text-secondary)}
.editor-panel__header{display:flex;justify-content:space-between;align-items:center;gap:12px;flex:0 0 auto;padding-bottom:12px;border-bottom:1px solid var(--border)}
.editor-panel__title-row{display:flex;align-items:baseline;gap:10px;min-width:0}.editor-panel__title-row h2{margin:0;font-size:16px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.editor-panel__saved{flex:0 0 auto;font-size:12px;color:var(--text-secondary);display:flex;align-items:center;gap:4px}.editor-panel__saved .dot{width:6px;height:6px;border-radius:50%;background:#4caf6d}
/* Linha de ações "de verdade" do capítulo — fica embaixo do
   cabeçalho (no lugar onde antes ficava a barra de formatação só
   decorativa) e quebra linha em telas menores em vez de cortar. */
.editor-panel__actions-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;flex:0 0 auto;padding:10px 0;border-bottom:1px solid var(--border)}
.editor-panel__canvas{display:flex;flex-direction:column;flex:1 1 0;min-height:0;overflow:hidden;border-radius:10px}
.editor-panel__textarea{display:block;width:100%;height:100%;min-height:0;flex:1;border:none;outline:none;resize:none;overflow-y:auto;background:transparent;color:var(--text-primary);font-size:15px;line-height:1.7;padding:20px 4px;box-sizing:border-box;font-family:inherit}
.editor-panel__footer{flex:0 0 auto;font-size:12px;color:var(--text-secondary);padding-top:8px;border-top:1px solid var(--border)}

/* #region Tipo de página (Texto / Imagem / Fundo) */
.editor-panel__page-type-switch{display:flex;align-items:center;gap:2px;padding:2px;border:1px solid var(--border);border-radius:9px;background:var(--bg-panel-alt)}
.page-type-button,.page-type-button--active{display:flex;align-items:center;gap:5px;height:26px;padding:0 9px;border:none;border-radius:7px;font-size:12px;background:transparent;color:var(--text-secondary)}
.page-type-button--active{background:var(--accent-purple);color:#fff;font-weight:600}
.page-type-button span,.page-type-button--active span{white-space:nowrap}
/* #endregion */

/* #region Buscar no texto */
.editor-panel__search-toggle,.editor-panel__search-toggle--active{flex:0 0 auto;display:flex;align-items:center;gap:6px;height:30px;padding:0 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg-panel-alt);color:var(--text-secondary);font-size:12px}
.editor-panel__search-toggle--active{border-color:var(--accent-purple);color:var(--accent-purple);background:var(--accent-purple-soft)}
.editor-panel__search-bar{display:flex;align-items:center;gap:8px;flex:0 0 auto;padding:8px 4px;border-bottom:1px solid var(--border);color:var(--text-secondary)}
.editor-panel__search-bar-icon{flex:0 0 auto;color:var(--text-muted)}
.editor-panel__search-bar-input{flex:1;min-width:0;border:none;outline:none;background:transparent;color:var(--text-primary);font-size:13px}
.editor-panel__search-bar-count{flex:0 0 auto;font-size:11px;color:var(--text-muted);white-space:nowrap}
.editor-panel__search-bar button{flex:0 0 auto;display:grid;place-items:center;width:26px;height:26px;border:none;border-radius:6px;background:transparent;color:var(--text-secondary)}
.editor-panel__search-bar button:hover:not(:disabled){background:var(--bg-panel-alt)}
.editor-panel__search-bar button:disabled{opacity:.35}
/* #endregion */

/* #region Página cheia de imagem ("image") */
.editor-panel__page-image-full{flex:1 1 0;min-height:0;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;padding:20px;overflow:auto}
.editor-panel__page-image-full-preview{max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;background:var(--bg-panel-alt)}
.editor-panel__page-image-full-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px;border:1px dashed var(--border-strong);border-radius:14px;color:var(--text-secondary);text-align:center;max-width:360px}
.editor-panel__page-image-full-empty p{margin:0;font-size:13px}
.editor-panel__page-image-full-actions{display:flex;align-items:center;gap:8px}
.editor-panel__page-image-upload{display:inline-flex;align-items:center;gap:7px;height:34px;padding:0 14px;border:1px solid var(--accent-purple);border-radius:9px;background:var(--accent-purple);color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap}
.editor-panel__page-image-remove{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 12px;border:1px solid var(--border);border-radius:9px;background:var(--bg-panel-alt);color:var(--text-secondary);font-size:12px}
.editor-panel__page-image-remove:hover{border-color:var(--danger);color:var(--danger)}
.editor-panel__page-image-error{margin:0;color:var(--danger);font-size:11px}
/* #endregion */

/* #region Fundo de página ("background") */
.editor-panel__page-background-bar{display:flex;align-items:center;gap:8px;flex:0 0 auto;margin:10px 4px 0;padding:6px 8px;border:1px solid var(--border);border-radius:9px;background:var(--bg-panel-alt);flex-wrap:wrap}
.editor-panel__page-background-label{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary)}
.editor-panel__page-background-thumb{width:26px;height:26px;border-radius:6px;object-fit:cover;border:1px solid var(--border)}
.editor-panel__page-image-upload-small{display:inline-flex;align-items:center;height:26px;padding:0 10px;border:1px solid var(--accent-purple);border-radius:7px;background:var(--accent-purple);color:#fff;font-size:11px;font-weight:700;cursor:pointer}
.editor-panel__page-image-remove-small{display:grid;place-items:center;width:26px;height:26px;border:1px solid var(--border);border-radius:7px;background:var(--bg-panel);color:var(--text-secondary)}
.editor-panel__page-image-remove-small:hover{border-color:var(--danger);color:var(--danger)}
.editor-panel__page-image-error-small{color:var(--danger);font-size:11px}
.editor-panel__textarea--on-image{background:rgba(255,255,255,.88)!important;color:#211f1b;border-radius:8px;margin:0 4px}
[data-theme='dark'] .editor-panel__textarea--on-image{background:rgba(18,17,22,.82)!important;color:#f2f1f6}
/* #endregion */

@media (max-width: 680px) {
  .page-type-button span{display:none}
  .editor-panel__search-toggle span,.editor-panel__search-toggle--active span{display:none}
}
`)

export const editorPanelCss = {
  panel:'panel', editorPanel:'editor-panel', editorPanelEmpty:'editor-panel--empty', editorPanelHeader:'editor-panel__header', editorPanelTitleRow:'editor-panel__title-row', editorPanelSaved:'editor-panel__saved', dot:'dot', editorPanelActionsRow:'editor-panel__actions-row', editorCanvas:'editor-panel__canvas', editorCanvasGrid:'editor-panel__canvas', editorPage:'', editorPageGrid:'', gridNotice:'', editorPanelTextarea:'editor-panel__textarea', editorPanelFooter:'editor-panel__footer',
  pageTypeSwitch:'editor-panel__page-type-switch', pageTypeButton:'page-type-button', pageTypeButtonActive:'page-type-button--active',
  searchToggle:'editor-panel__search-toggle', searchToggleActive:'editor-panel__search-toggle--active',
  searchBar:'editor-panel__search-bar', searchBarIcon:'editor-panel__search-bar-icon', searchBarInput:'editor-panel__search-bar-input', searchBarCount:'editor-panel__search-bar-count',
  pageImageFull:'editor-panel__page-image-full', pageImageFullPreview:'editor-panel__page-image-full-preview', pageImageFullEmpty:'editor-panel__page-image-full-empty', pageImageFullActions:'editor-panel__page-image-full-actions',
  pageImageUploadButton:'editor-panel__page-image-upload', pageImageRemoveButton:'editor-panel__page-image-remove', pageImageError:'editor-panel__page-image-error',
  pageBackgroundBar:'editor-panel__page-background-bar', pageBackgroundLabel:'editor-panel__page-background-label', pageBackgroundThumb:'editor-panel__page-background-thumb',
  pageImageUploadButtonSmall:'editor-panel__page-image-upload-small', pageImageRemoveButtonSmall:'editor-panel__page-image-remove-small', pageImageErrorSmall:'editor-panel__page-image-error-small',
  editorPanelTextareaOnImage:'editor-panel__textarea--on-image',
} as const
