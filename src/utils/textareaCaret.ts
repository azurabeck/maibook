// Descobre a posição vertical (em px, relativa ao topo do texto) de um
// índice de caractere dentro de um <textarea> — usado pela busca do
// editor pra rolar até o trecho encontrado, já que <textarea> não
// expõe isso nativamente.
//
// Técnica clássica do "mirror div": criamos uma <div> invisível com a
// mesma fonte/largura/padding do textarea, colocamos o texto até o
// índice desejado dentro dela e medimos onde ela "quebraria" a linha.

const MIRRORED_PROPERTIES: Array<keyof CSSStyleDeclaration> = [
  'boxSizing', 'width', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'letterSpacing',
  'lineHeight', 'textAlign', 'textTransform', 'textIndent', 'wordSpacing',
]

export function getTextareaCaretOffsetTop(textarea: HTMLTextAreaElement, index: number): number {
  const computed = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')

  mirror.style.position = 'absolute'
  mirror.style.visibility = 'hidden'
  mirror.style.left = '-9999px'
  mirror.style.top = '0'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'
  mirror.style.overflowWrap = 'break-word'

  MIRRORED_PROPERTIES.forEach((property) => {
    // @ts-expect-error -- copiando propriedades dinamicamente do CSSStyleDeclaration
    mirror.style[property] = computed[property]
  })

  mirror.textContent = textarea.value.slice(0, index)
  const marker = document.createElement('span')
  marker.textContent = '​' // caractere zero-width só pra ter algo pra medir
  mirror.appendChild(marker)

  document.body.appendChild(mirror)
  const offsetTop = marker.offsetTop
  document.body.removeChild(mirror)

  return offsetTop
}

// Rola o textarea até o índice informado ficar visível, aproximadamente
// no primeiro terço da área visível.
export function scrollTextareaToIndex(textarea: HTMLTextAreaElement, index: number) {
  const offsetTop = getTextareaCaretOffsetTop(textarea, index)
  const target = offsetTop - textarea.clientHeight / 3
  textarea.scrollTop = Math.max(0, target)
}
