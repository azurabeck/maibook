// Utilitário pequeno para manter CSS dentro de arquivos .ts.
// Cada css.ts declara seu próprio bloco e injeta no <head>.
// Se a tag já existir (ex: HMR reexecutando o módulo depois de uma
// edição), atualizamos o conteúdo em vez de ignorar — senão o CSS
// editado nunca aparece até um reload manual da página.
export function injectStyleSheet(styleId: string, cssText: string) {
  if (typeof document === 'undefined') return

  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = styleId
    document.head.appendChild(styleElement)
  }
  styleElement.textContent = cssText
}
