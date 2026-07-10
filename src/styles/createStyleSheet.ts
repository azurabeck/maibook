// Utilitário pequeno para manter CSS dentro de arquivos .ts.
// Cada css.ts declara seu próprio bloco e injeta uma única vez no <head>.
export function injectStyleSheet(styleId: string, cssText: string) {
  if (typeof document === 'undefined') return
  if (document.getElementById(styleId)) return

  const styleElement = document.createElement('style')
  styleElement.id = styleId
  styleElement.textContent = cssText
  document.head.appendChild(styleElement)
}
