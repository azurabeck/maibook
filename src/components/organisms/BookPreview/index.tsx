import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal, flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BookOpen, FileText, LoaderCircle, Printer, X } from 'lucide-react'
import type { BookCover, BookSection, BookSummary, Chapter, ChapterFooter, ChapterGrid, FooterPosition } from '@/types'
import { getPageFormat } from '@/constants/pageFormats'
import { HeaderPreview } from '@/components/organisms/ChapterHeader/index'
import { BookSummaryView, buildSummaryEntries } from '@/components/organisms/BookSummaryView/index'
import type { SummaryEntry } from '@/components/organisms/BookSummaryView/index'
import { chapterSectionId, resolveBookSections, sortChaptersForReading } from '@/utils/chapterTree'
import { downloadBlob, generateBookDocxBlob } from '@/services/export/docx'
import {
  HEADER_CONTENT_GAP_MM,
  MM_TO_PX,
  PT_TO_PX,
  getFooterReserveMm,
  safeFileName,
  splitParagraphs,
} from '@/services/export/layout'
import { joinStyledWords, splitStyledWords, type StyledWord, type TextRun } from '@/utils/inlineFormat'
import { bookPreviewCss } from './css'

interface BookPreviewProps {
  chapters: Chapter[]
  activeChapterId: string | null
  bookTitle?: string
  cover?: BookCover
  summary?: BookSummary
  sections?: BookSection[] // ordem das seções do livro (ver resolveBookSections)
}

function hasCoverContent(cover?: BookCover): cover is BookCover {
  return Boolean(cover && (cover.imageUrl || cover.title || cover.subtitle))
}

// palavras com negrito/itálico (ver utils/inlineFormat.ts) — o
// parágrafo é quebrado linha por linha entre as páginas
interface PageParagraph {
  words: StyledWord[]
  continued?: boolean // continuação da página anterior: sem recuo de primeira linha
  continuesOnNextPage?: boolean // termina no meio: a última linha também fica justificada
}

// mínimo de linhas de um parágrafo dividido que ficam no fim de uma
// página (órfãs) e no começo da seguinte (viúvas)
const MIN_LINES_AT_BREAK = 2

// cada trecho vira <strong>/<em> conforme o estilo
function runToNode(run: TextRun): Node {
  let node: Node = document.createTextNode(run.text)
  if (run.italic) {
    const em = document.createElement('em')
    em.appendChild(node)
    node = em
  }
  if (run.bold) {
    const strong = document.createElement('strong')
    strong.appendChild(node)
    node = strong
  }
  return node
}

function StyledRun({ run }: { run: TextRun }) {
  let node: ReactNode = run.text
  if (run.italic) node = <em>{node}</em>
  if (run.bold) node = <strong>{node}</strong>
  return <>{node}</>
}

interface PreviewPage {
  id: string
  chapter: Chapter
  grid?: ChapterGrid
  width: number
  height: number
  paragraphs: PageParagraph[]
  chapterPageIndex: number
  contentHeight: number
  isFullImage?: boolean // pageType 'image': a página é só a imagem, sem margens/texto
  backgroundImageUrl?: string // pageType 'background': imagem atrás do texto desta página
}

// Uma "fatia" do sumário que cabe numa página — o sumário sempre
// começa na primeira página (título + texto antes), mas se a lista de
// capítulos for grande, continua em quantas páginas forem precisas,
// só com os itens (sem repetir título/texto antes); o texto depois só
// entra na última, se sobrar espaço.
interface SummaryPageData {
  entries: SummaryEntry[]
  columnBreak?: number // 2 colunas: onde começa a coluna da direita
  showTitle: boolean
  showTextBefore: boolean
  showTextAfter: boolean
}

function FooterPreview({ footer, chapterTitle, pageNumber }: { footer: ChapterFooter; chapterTitle: string; pageNumber: number }) {
  const content = (type: ChapterFooter['items'][number]['type']) => {
    if (type === 'note') return footer.noteText
    if (type === 'chapter-title') return chapterTitle
    return String(pageNumber)
  }

  return (
    <div
      className={bookPreviewCss.footer}
      style={{
        fontFamily: footer.fontFamily,
        fontSize: `${footer.fontSize}pt`,
        paddingTop: footer.spacingTop,
        borderTop: footer.borderTop ? '1px solid currentColor' : 'none',
      }}
    >
      {(['left', 'center', 'right'] as FooterPosition[]).map((position) => (
        <div key={position}>
          {footer.items.filter((item) => item.position === position).map((item) => (
            <span key={item.type}>{content(item.type)}</span>
          ))}
        </div>
      ))}
    </div>
  )
}

function createMeasureBox(grid: ChapterGrid | undefined, widthPx: number, heightPx: number) {
  const box = document.createElement('div')
  box.style.position = 'fixed'
  box.style.left = '-100000px'
  box.style.top = '0'
  box.style.visibility = 'hidden'
  box.style.boxSizing = 'border-box'
  box.style.width = `${widthPx}px`
  box.style.height = `${heightPx}px`
  box.style.overflow = 'hidden'
  box.style.fontFamily = grid?.fontFamily || 'Georgia, serif'
  box.style.fontSize = grid ? `${grid.fontSize}pt` : '11pt'
  box.style.lineHeight = String(grid?.lineHeight ?? 1.5)
  box.style.textAlign = grid?.textAlignment ?? 'justify'
  box.style.hyphens = grid?.hyphenation ? 'auto' : 'none'
  box.style.overflowWrap = 'break-word'
  box.style.columnCount = String(grid?.columns ?? 1)
  box.style.columnGap = `${(grid?.columnGap ?? 8) * MM_TO_PX}px`
  box.style.columnFill = 'auto'
  document.body.appendChild(box)
  return box
}

function textAlignLast(paragraph: PageParagraph, grid?: ChapterGrid) {
  return paragraph.continuesOnNextPage && (grid?.textAlignment ?? 'justify') === 'justify' ? 'justify' : ''
}

function styleParagraph(element: HTMLParagraphElement, paragraph: PageParagraph, grid?: ChapterGrid) {
  element.style.margin = '0'
  element.style.marginBottom = `${(grid?.paragraphSpacing ?? 4) * PT_TO_PX}px`
  element.style.textIndent = paragraph.continued ? '0' : `${(grid?.firstLineIndent ?? 0) * MM_TO_PX}px`
  element.style.textAlignLast = textAlignLast(paragraph, grid)
  element.style.breakInside = 'avoid-column'
}

function appendParagraph(box: HTMLDivElement, paragraph: PageParagraph, grid?: ChapterGrid) {
  const element = document.createElement('p')
  element.replaceChildren(...joinStyledWords(paragraph.words).map(runToNode))
  styleParagraph(element, paragraph, grid)
  box.appendChild(element)
  return element
}

function hasOverflow(box: HTMLDivElement) {
  return box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1
}

function fits(box: HTMLDivElement, paragraphs: PageParagraph[], grid?: ChapterGrid) {
  box.replaceChildren()
  paragraphs.forEach((paragraph) => appendParagraph(box, paragraph, grid))
  return !hasOverflow(box)
}

// Onde começa cada linha do parágrafo: palavra e, se a linha começa
// no meio de uma palavra hifenizada, o caractere dentro dela.
interface LineStart {
  word: number
  char: number
}

// Mede as linhas do parágrafo inteiro numa coluna sem limite de
// altura, com a mesma tipografia da página — dividir exatamente nesses
// pontos mantém as quebras de linha (e a hifenização) da composição
// original dos dois lados da quebra de página.
function measureLineStarts(paragraph: PageParagraph, grid: ChapterGrid | undefined, columnWidthPx: number): LineStart[] {
  const probe = createMeasureBox(grid, columnWidthPx, 0)
  probe.style.height = 'auto'
  probe.style.columnCount = 'auto'

  const element = document.createElement('p')
  const spans = paragraph.words.map((word, index) => {
    if (index > 0) {
      const before = paragraph.words[index - 1][paragraph.words[index - 1].length - 1]
      element.appendChild(runToNode({ text: ' ', bold: before.bold && word[0].bold, italic: before.italic && word[0].italic }))
    }
    const span = document.createElement('span')
    span.replaceChildren(...word.map(runToNode))
    element.appendChild(span)
    return span
  })
  styleParagraph(element, paragraph, grid)
  probe.appendChild(element)

  try {
    const threshold = (parseFloat(window.getComputedStyle(element).lineHeight) || 8) / 2
    const starts: LineStart[] = []
    let lineTop = -Infinity
    const opensLine = (top: number) => {
      if (top <= lineTop + threshold) return false
      lineTop = top
      return true
    }

    spans.forEach((span, wordIndex) => {
      const rects = span.getClientRects()
      if (!rects.length) return
      if (opensLine(rects[0].top)) starts.push({ word: wordIndex, char: 0 })
      if (rects.length === 1) return

      // palavra partida entre linhas (hifenização): acha o caractere
      // que abre a linha seguinte
      const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT)
      const range = document.createRange()
      let offset = 0
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const length = node.textContent?.length ?? 0
        for (let index = 0; index < length; index += 1) {
          range.setStart(node, index)
          range.setEnd(node, index + 1)
          const rect = range.getClientRects()[0]
          if (rect && offset + index > 0 && opensLine(rect.top)) starts.push({ word: wordIndex, char: offset + index })
        }
        offset += length
      }
    })

    return starts
  } finally {
    probe.remove()
  }
}

// Parte uma palavra num caractere; a primeira parte ganha o hífen
// que o navegador desenhava no fim da linha.
function splitStyledWord(word: StyledWord, offset: number): [StyledWord, StyledWord] {
  const head: StyledWord = []
  const tail: StyledWord = []
  let position = 0
  for (const run of word) {
    const end = position + run.text.length
    if (end <= offset) head.push(run)
    else if (position >= offset) tail.push(run)
    else {
      head.push({ ...run, text: run.text.slice(0, offset - position) })
      tail.push({ ...run, text: run.text.slice(offset - position) })
    }
    position = end
  }
  const last = head[head.length - 1]
  if (last && !/[-‐­]$/.test(last.text)) head[head.length - 1] = { ...last, text: `${last.text}-` }
  return [head, tail]
}

function splitWordsAtLine(words: StyledWord[], start: LineStart): [StyledWord[], StyledWord[]] {
  if (start.char === 0) return [words.slice(0, start.word), words.slice(start.word)]
  const [head, tail] = splitStyledWord(words[start.word], start.char)
  return [[...words.slice(0, start.word), head], [tail, ...words.slice(start.word + 1)]]
}

// O parágrafo não cabe inteiro no espaço que sobrou: divide pelo maior
// número de linhas que cabe, deixando pelo menos 2 linhas nesta página
// e 2 na próxima. Se não der pra dividir assim, devolve null e o
// parágrafo inteiro vai pra próxima página. Numa página vazia sempre
// coloca alguma coisa, pra paginação nunca travar.
function splitParagraphToFit(
  box: HTMLDivElement,
  existing: PageParagraph[],
  paragraph: PageParagraph,
  grid: ChapterGrid | undefined,
  columnWidthPx: number,
): { head: PageParagraph; tail: StyledWord[] } | null {
  const starts = measureLineStarts(paragraph, grid, columnWidthPx)
  const headWithLines = (lines: number): PageParagraph => ({
    words: splitWordsAtLine(paragraph.words, starts[lines])[0],
    continued: paragraph.continued,
    continuesOnNextPage: true,
  })

  const largestFitting = (min: number, max: number) => {
    let low = min
    let high = max
    let best = 0
    while (low <= high) {
      const middle = Math.floor((low + high) / 2)
      if (fits(box, [...existing, headWithLines(middle)], grid)) {
        best = middle
        low = middle + 1
      } else {
        high = middle - 1
      }
    }
    return best
  }

  let lines = largestFitting(MIN_LINES_AT_BREAK, starts.length - MIN_LINES_AT_BREAK)
  if (!lines && existing.length === 0) lines = largestFitting(1, starts.length - 1) || 1
  if (!lines) return null
  if (lines >= starts.length) return { head: paragraph, tail: [] }

  return { head: headWithLines(lines), tail: splitWordsAtLine(paragraph.words, starts[lines])[1] }
}

// Altura real da abertura do capítulo (ícone + nome): renderiza o mesmo
// HeaderPreview da página fora da tela e mede. A estimativa por conta
// (estimateHeaderHeightPx) errava por alguns pixels ou por uma linha
// inteira, e a caixa de texto da 1ª página terminava fora do lugar.
function measureHeaderHeightPx(chapter: Chapter, widthPx: number) {
  const header = chapter.header
  if (!header) return 0

  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-100000px'
  host.style.top = '0'
  host.style.visibility = 'hidden'
  host.style.width = `${widthPx}px`
  document.body.appendChild(host)
  const root = createRoot(host)
  try {
    flushSync(() => root.render(<HeaderPreview structure={header} />))
    return host.getBoundingClientRect().height
  } finally {
    root.unmount()
    host.remove()
  }
}

function paginateChapter(chapter: Chapter): PreviewPage[] {
  const grid = chapter.grid
  const format = getPageFormat(grid?.pageFormat ?? 'a5')
  const portrait = grid?.orientation !== 'landscape'
  const width = portrait ? format.width : format.height
  const height = portrait ? format.height : format.width

  // pageType 'image': a página inteira é uma única imagem, sem
  // margens, cabeçalho, rodapé ou texto — nem entra na paginação normal.
  if (chapter.pageType === 'image') {
    return [{
      id: `${chapter.id}-0`,
      chapter,
      grid,
      width,
      height,
      paragraphs: [],
      chapterPageIndex: 0,
      contentHeight: height,
      isFullImage: true,
    }]
  }

  const backgroundImageUrl = chapter.pageType === 'background' ? chapter.pageImageUrl : undefined
  const contentWidthMm = width - (grid?.marginLeft ?? 16) - (grid?.marginRight ?? 16)
  const baseContentHeightMm = height
    - (grid?.marginTop ?? 18)
    - (grid?.marginBottom ?? 20)
    - getFooterReserveMm(chapter.footer)

  const contentWidthPx = contentWidthMm * MM_TO_PX
  const columns = grid?.columns ?? 1
  const columnWidthPx = (contentWidthPx - (columns - 1) * (grid?.columnGap ?? 8) * MM_TO_PX) / columns
  const headerReserveMm = chapter.header ? measureHeaderHeightPx(chapter, contentWidthPx) / MM_TO_PX + HEADER_CONTENT_GAP_MM : 0

  const paragraphs = splitParagraphs(chapter.content)
  if (!paragraphs.length) {
    return [{ id: `${chapter.id}-0`, chapter, grid, width, height, paragraphs: [], chapterPageIndex: 0, contentHeight: baseContentHeightMm - headerReserveMm, backgroundImageUrl }]
  }

  const pages: PreviewPage[] = []
  let paragraphIndex = 0
  let remainingWords: StyledWord[] | null = null
  let isContinuation = false

  while (paragraphIndex < paragraphs.length || remainingWords) {
    const pageIndex = pages.length
    const contentHeightMm = Math.max(20, baseContentHeightMm - (pageIndex === 0 ? headerReserveMm : 0))
    const box = createMeasureBox(grid, contentWidthPx, contentHeightMm * MM_TO_PX)
    const pageParagraphs: PageParagraph[] = []

    try {
      while (paragraphIndex < paragraphs.length || remainingWords) {
        const words: StyledWord[] = remainingWords ?? splitStyledWords(paragraphs[paragraphIndex])
        const paragraph: PageParagraph = { words, continued: isContinuation }
        const candidate = [...pageParagraphs, paragraph]

        if (fits(box, candidate, grid)) {
          pageParagraphs.push(paragraph)
          remainingWords = null
          isContinuation = false
          paragraphIndex += 1
          continue
        }

        // não cabe inteiro: a parte que cabe fica aqui e o resto abre a
        // próxima página (ou, sem poder dividir, vai inteiro pra ela)
        const split = splitParagraphToFit(box, pageParagraphs, paragraph, grid, columnWidthPx)
        if (split) {
          pageParagraphs.push(split.head)
          if (split.tail.length) {
            remainingWords = split.tail
            isContinuation = true
          } else {
            remainingWords = null
            isContinuation = false
            paragraphIndex += 1
          }
        }
        break
      }
    } finally {
      box.remove()
    }

    pages.push({
      id: `${chapter.id}-${pageIndex}`,
      chapter,
      grid,
      width,
      height,
      paragraphs: pageParagraphs,
      chapterPageIndex: pageIndex,
      contentHeight: contentHeightMm,
      backgroundImageUrl,
    })
  }

  return pages
}

// Mede, numa caixa escondida fora da tela, a altura real (margens
// incluídas) de cada bloco do sumário — título, texto antes/depois e
// cada item — renderizando o próprio BookSummaryView. Cada parte pode
// ter fonte, tamanho e espaçamento próprios (título, agrupamento,
// capítulo), então os itens não têm mais todos a mesma altura.
function measureSummaryHeights(summary: BookSummary, entries: SummaryEntry[], contentWidthPx: number) {
  const host = document.createElement('div')
  host.style.position = 'fixed'
  host.style.left = '-100000px'
  host.style.top = '0'
  host.style.visibility = 'hidden'
  host.style.width = `${contentWidthPx}px`
  document.body.appendChild(host)
  const root = createRoot(host)

  // getBoundingClientRect() não inclui margin — mas é exatamente a
  // margem que separa um bloco do próximo, então ela precisa entrar
  // na conta (os blocos ficam em colunas flex, onde margens não colapsam).
  const outerHeight = (element: Element | null) => {
    if (!element) return 0
    const style = window.getComputedStyle(element)
    return element.getBoundingClientRect().height + parseFloat(style.marginTop || '0') + parseFloat(style.marginBottom || '0')
  }

  try {
    flushSync(() => root.render(<BookSummaryView summary={summary} entries={entries} />))
    return {
      title: outerHeight(host.querySelector('[data-summary-part="title"]')),
      textBefore: outerHeight(host.querySelector('[data-summary-part="before"]')),
      textAfter: outerHeight(host.querySelector('[data-summary-part="after"]')),
      rows: Array.from(host.querySelectorAll('[data-summary-part="row"]'), outerHeight),
    }
  } finally {
    root.unmount()
    host.remove()
  }
}

// Última página de um sumário em 2 colunas: acha o ponto de divisão
// que deixa as duas colunas com alturas mais parecidas (sem título de
// agrupamento sozinho no fim da coluna da esquerda).
function balanceSummaryColumns(rows: number[], entries: SummaryEntry[], limit: number) {
  const total = rows.reduce((sum, height) => sum + height, 0)
  let best: { columnBreak: number; tallest: number } | null = null
  let left = 0
  for (let breakAt = 1; breakAt <= rows.length; breakAt += 1) {
    left += rows[breakAt - 1]
    const right = total - left
    if (left > limit || right > limit) continue
    if (breakAt < rows.length && entries[breakAt - 1].isGroup) continue
    const tallest = Math.max(left, right)
    if (!best || tallest < best.tallest) best = { columnBreak: breakAt, tallest }
  }
  return best
}

// Distribui os itens do sumário em quantas páginas forem necessárias
// pra caber no espaço real de conteúdo de uma página do livro. Em 2
// colunas, cada página enche a coluna da esquerda e depois a da direita.
function paginateSummaryEntries(
  summary: BookSummary,
  entries: SummaryEntry[],
  contentWidthPx: number,
  contentHeightPx: number,
): SummaryPageData[] {
  const heights = measureSummaryHeights(summary, entries, contentWidthPx)
  const columnCount = summary.columns === 2 ? 2 : 1
  const pages: SummaryPageData[] = []
  let index = 0
  let isFirst = true

  while (index < entries.length || isFirst) {
    const pageHeight = contentHeightPx - (isFirst ? heights.title + heights.textBefore : 0)
    const start = index
    let columnBreak: number | undefined
    let lowestAvailable = pageHeight

    for (let column = 0; column < columnCount; column += 1) {
      const columnStart = index
      let available = pageHeight
      while (index < entries.length && heights.rows[index] <= available) {
        // título de agrupamento não fica sozinho no pé da coluna
        const next = heights.rows[index + 1]
        if (entries[index].isGroup && next !== undefined && heights.rows[index] + next > available && index > columnStart) break
        available -= heights.rows[index]
        index += 1
      }
      lowestAvailable = Math.min(lowestAvailable, available)
      if (column === 0 && columnCount === 2) columnBreak = index - start
    }
    if (index === start && index < entries.length) index += 1 // segurança: sempre avança ao menos 1 item

    const isLastEntriesPage = index >= entries.length
    if (isLastEntriesPage && columnCount === 2) {
      const balanced = balanceSummaryColumns(heights.rows.slice(start, index), entries.slice(start, index), pageHeight)
      if (balanced) {
        columnBreak = balanced.columnBreak
        lowestAvailable = pageHeight - balanced.tallest
      }
    }
    const includeTextAfter = isLastEntriesPage && Boolean(summary.textAfter) && lowestAvailable >= heights.textAfter

    pages.push({ entries: entries.slice(start, index), columnBreak, showTitle: isFirst, showTextBefore: isFirst, showTextAfter: includeTextAfter })
    isFirst = false

    if (isLastEntriesPage) break
  }

  if (summary.textAfter && !pages.some((page) => page.showTextAfter)) {
    pages.push({ entries: [], showTitle: false, showTextBefore: false, showTextAfter: true })
  }

  return pages
}

export function BookPreview({ chapters, activeChapterId, bookTitle, cover, summary, sections }: BookPreviewProps) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<PreviewPage[]>([])
  const [paginating, setPaginating] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  // Ordem de leitura do livro: capítulo-pai seguido de seus filhos
  // (aninhados via drag-and-drop na lista lateral), não um simples
  // sort por `order` — esse campo só é único entre irmãos, não global
  // (ver src/utils/chapterTree.ts).
  // As seções (Dedicatória, Sumário, Capítulos, Glossário...) vêm na
  // ordem montada na lista lateral.
  const bookSections = useMemo(() => resolveBookSections(sections), [sections])
  const orderedChapters = useMemo(() => sortChaptersForReading(chapters, bookSections), [chapters, bookSections])

  // Capa e sumário usam o mesmo formato/orientação/margens de página
  // do primeiro capítulo (ou A5 retrato, se ainda não houver nenhum),
  // só pra manter a proporção coerente com o resto do livro na prévia.
  const frontMatterGeometry = useMemo(() => {
    const grid = orderedChapters[0]?.grid
    const format = getPageFormat(grid?.pageFormat ?? 'a5')
    const portrait = grid?.orientation !== 'landscape'
    return {
      width: portrait ? format.width : format.height,
      height: portrait ? format.height : format.width,
      marginTop: grid?.marginTop ?? 18,
      marginRight: grid?.marginRight ?? 16,
      marginBottom: grid?.marginBottom ?? 20,
      marginLeft: grid?.marginLeft ?? 16,
    }
  }, [orderedChapters])

  const [summaryPages, setSummaryPages] = useState<SummaryPageData[]>([])
  // quantas páginas de capítulo vêm antes do sumário (as das seções
  // que estão acima dele na lista lateral)
  const [summaryInsertAt, setSummaryInsertAt] = useState(0)

  // Capa e sumário (quando existem) entram antes dos capítulos, então
  // a numeração de página dos capítulos precisa deslocar por essa
  // quantidade de páginas de "pré-texto" pra bater com o número que o
  // próprio sumário mostra pra cada capítulo. Como o sumário pode
  // ocupar mais de uma página (lista grande de capítulos), a
  // paginação dele é calculada aqui, na mesma passada que a dos
  // capítulos — e só depois disso dá pra saber o deslocamento certo
  // pra numerar as páginas dos capítulos e do próprio sumário.
  useEffect(() => {
    if (!open) return
    setPaginating(true)
    const frame = window.requestAnimationFrame(() => {
      const chapterPages = orderedChapters.flatMap(paginateChapter)
      setPages(chapterPages)

      const sectionIndex = new Map(bookSections.map((section, index) => [section.id, index]))
      const summarySectionIndex = bookSections.findIndex((section) => section.kind === 'summary')
      const insertAt = chapterPages.filter((page) => (sectionIndex.get(chapterSectionId(page.chapter, chapters, bookSections)) ?? 0) < summarySectionIndex).length
      setSummaryInsertAt(insertAt)

      if (summary) {
        // números de página ainda desconhecidos: dependem de quantas
        // páginas o próprio sumário vai ocupar (calculado logo abaixo)
        const rawEntries = buildSummaryEntries(chapters, summary, new Map(), bookSections)

        const contentWidthPx = (frontMatterGeometry.width - frontMatterGeometry.marginLeft - frontMatterGeometry.marginRight) * MM_TO_PX
        const contentHeightPx = (frontMatterGeometry.height - frontMatterGeometry.marginTop - frontMatterGeometry.marginBottom) * MM_TO_PX
        const chunks = paginateSummaryEntries(summary, rawEntries, contentWidthPx, contentHeightPx)

        const coverCount = hasCoverContent(cover) ? 1 : 0
        const chapterStartPage = new Map<string, number>()
        chapterPages.forEach((page, index) => {
          if (page.chapterPageIndex === 0 && !chapterStartPage.has(page.chapter.id)) {
            chapterStartPage.set(page.chapter.id, coverCount + index + 1 + (index >= insertAt ? chunks.length : 0))
          }
        })

        setSummaryPages(chunks.map((chunk) => ({
          ...chunk,
          entries: chunk.entries.map((entry) => ({ ...entry, pageNumber: chapterStartPage.get(entry.id) })),
        })))
      } else {
        setSummaryPages([])
      }

      setPaginating(false)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, orderedChapters, chapters, bookSections, summary, cover, frontMatterGeometry])

  // Número impresso da página de capítulo `pageIndex`: capa e páginas
  // do sumário que vêm antes dela também contam.
  function pageNumberAt(pageIndex: number) {
    const coverCount = hasCoverContent(cover) ? 1 : 0
    return coverCount + pageIndex + 1 + (pageIndex >= summaryInsertAt ? summaryPages.length : 0)
  }

  // PDF via geração customizada (jsPDF) dependia de baixar as imagens
  // de novo pra embutir os bytes — e como o bucket do Storage não
  // libera CORS pra leitura crua (só pra exibir em <img>, que é o que
  // a prévia usa), esse download falhava silenciosamente e o PDF saía
  // sem imagem nenhuma. Usar a impressão nativa do navegador evita
  // isso de vez: ele imprime a prévia como está na tela (imagens via
  // <img> normal, sem precisar ler os bytes por JS), e todo navegador
  // já tem "Salvar como PDF" na própria janela de impressão.
  function handlePrint() {
    window.print()
  }

  // Além do PDF (só leitura), gera o livro num .docx editável — pra
  // quem quer continuar mexendo no texto em outro programa (Word,
  // LibreOffice, Google Docs...). Não depende da paginação calculada
  // acima: lê os capítulos direto e monta o documento do zero.
  async function downloadDocx() {
    if (downloadingDocx) return

    setDownloadingDocx(true)
    try {
      const blob = await generateBookDocxBlob(orderedChapters, bookTitle, bookSections)
      downloadBlob(blob, `${safeFileName(bookTitle)}.docx`)
    } catch (error) {
      console.error('Falha ao gerar DOCX:', error)
      window.alert('Não foi possível gerar o arquivo editável. Tente novamente.')
    } finally {
      setDownloadingDocx(false)
    }
  }

  // Uma página do sumário (só existe com summary definido)
  function renderSummaryPage(summaryPage: SummaryPageData, summaryPageIndex: number) {
    if (!summary) return null
    return (
      <article
        key={`summary-${summaryPageIndex}`}
        className={bookPreviewCss.page}
        data-book-page="true"
        style={{
          width: `${frontMatterGeometry.width}mm`,
          height: `${frontMatterGeometry.height}mm`,
          padding: `${frontMatterGeometry.marginTop}mm ${frontMatterGeometry.marginRight}mm ${frontMatterGeometry.marginBottom}mm ${frontMatterGeometry.marginLeft}mm`,
        }}
      >
        <BookSummaryView
          summary={summary}
          entries={summaryPage.entries}
          columnBreak={summaryPage.columnBreak}
          showTitle={summaryPage.showTitle}
          showTextBefore={summaryPage.showTextBefore}
          showTextAfter={summaryPage.showTextAfter}
        />
      </article>
    )
  }

  function renderChapterPage(page: PreviewPage, pageIndex: number) {
    const { chapter, grid } = page
    const isFirstChapterPage = page.chapterPageIndex === 0

    if (page.isFullImage) {
      return (
        <article
          className={bookPreviewCss.page}
          key={page.id}
          data-active={chapter.id === activeChapterId}
          data-book-page="true"
          style={{ width: `${page.width}mm`, height: `${page.height}mm`, padding: 0 }}
        >
          {chapter.pageImageUrl ? (
            <img
              src={chapter.pageImageUrl}
              alt={chapter.title}
              style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div className={bookPreviewCss.empty} style={{ minHeight: '100%', color: '#a29a8c' }}>
              Nenhuma imagem definida para esta página.
            </div>
          )}
        </article>
      )
    }

    return (
      <article
        className={bookPreviewCss.page}
        key={page.id}
        data-active={chapter.id === activeChapterId}
        data-book-page="true"
        style={{
          width: `${page.width}mm`,
          height: `${page.height}mm`,
          padding: `${grid?.marginTop ?? 18}mm ${grid?.marginRight ?? 16}mm ${grid?.marginBottom ?? 20}mm ${grid?.marginLeft ?? 16}mm`,
          backgroundImage: page.backgroundImageUrl ? `url(${page.backgroundImageUrl})` : undefined,
          backgroundSize: page.backgroundImageUrl ? 'cover' : undefined,
          backgroundPosition: page.backgroundImageUrl ? 'center' : undefined,
        }}
      >
        <span className={bookPreviewCss.chapterLabel}>{chapter.title}</span>
        {isFirstChapterPage && chapter.header && (
          <div className={bookPreviewCss.header}><HeaderPreview structure={chapter.header} /></div>
        )}
        <div
          lang="pt-BR"
          className={bookPreviewCss.content}
          style={{
            fontFamily: grid?.fontFamily || 'Georgia, serif',
            fontSize: grid ? `${grid.fontSize}pt` : '11pt',
            lineHeight: grid?.lineHeight ?? 1.5,
            textAlign: grid?.textAlignment ?? 'justify',
            hyphens: grid?.hyphenation ? 'auto' : 'none',
            columnCount: grid?.columns ?? 1,
            columnGap: `${grid?.columnGap ?? 8}mm`,
            height: `${page.contentHeight}mm`,
          }}
        >
          {page.paragraphs.length > 0 ? page.paragraphs.map((paragraph, paragraphIndex) => (
            <p
              key={`${page.id}-${paragraphIndex}`}
              style={{
                marginBottom: `${grid?.paragraphSpacing ?? 4}pt`,
                textIndent: paragraph.continued ? 0 : `${grid?.firstLineIndent ?? 0}mm`,
                textAlignLast: textAlignLast(paragraph, grid) || undefined,
              }}
            >
              {joinStyledWords(paragraph.words).map((run, runIndex) => <StyledRun key={runIndex} run={run} />)}
            </p>
          )): ""}
        </div>
        {chapter.footer ? (
          <div
            className={bookPreviewCss.footerWrapper}
            style={{
              left: `${grid?.marginLeft ?? 16}mm`,
              right: `${grid?.marginRight ?? 16}mm`,
              bottom: '5mm',
            }}
          >
            <FooterPreview footer={chapter.footer} chapterTitle={chapter.title} pageNumber={pageNumberAt(pageIndex)} />
          </div>
        ) : (
          <span className={bookPreviewCss.pageNumber}>{pageNumberAt(pageIndex)}</span>
        )}
      </article>
    )
  }

  return (
    <>
      <button className={bookPreviewCss.trigger} type="button" onClick={() => setOpen(true)} title="Visualizar o livro paginado">
        <BookOpen size={15} />
        <span>Visualizar livro</span>
      </button>

      {open && createPortal(
        <div className={bookPreviewCss.overlay} role="dialog" aria-modal="true">
          <header className={bookPreviewCss.topbar}>
            <div className={bookPreviewCss.title}>
              <BookOpen size={18} />
              <div><h2>{bookTitle || 'Visualização do livro'}</h2><span>Paginação real, margens e composição editorial</span></div>
            </div>
            <div className={bookPreviewCss.topbarActions}>
              <button
                className={bookPreviewCss.download}
                type="button"
                onClick={handlePrint}
                disabled={paginating || (!pages.length && !hasCoverContent(cover) && !summary)}
                title="Imprimir ou salvar como PDF (janela de impressão do navegador)"
              >
                <Printer size={16} />
                <span>Imprimir / Salvar PDF</span>
              </button>
              <button
                className={bookPreviewCss.download}
                type="button"
                onClick={() => void downloadDocx()}
                disabled={!orderedChapters.length || downloadingDocx}
                title="Baixar livro em DOCX (arquivo editável no Word, LibreOffice, Google Docs...)"
              >
                {downloadingDocx ? <LoaderCircle className={bookPreviewCss.spinner} size={16} /> : <FileText size={16} />}
                <span>{downloadingDocx ? 'Gerando DOCX...' : 'Baixar DOCX'}</span>
              </button>
              <button className={bookPreviewCss.close} type="button" onClick={() => setOpen(false)} aria-label="Fechar visualização"><X size={18} /></button>
            </div>
          </header>

          <main className={bookPreviewCss.viewport}>
            {paginating ? <div className={bookPreviewCss.empty}>Formatando e separando as páginas...</div> : (!pages.length && !hasCoverContent(cover) && !summary) ? (
              <div className={bookPreviewCss.empty}>Nenhum capítulo para visualizar.</div>
            ) : (
              <div className={bookPreviewCss.book}>
                {hasCoverContent(cover) && (
                  <article
                    className={bookPreviewCss.page}
                    data-book-page="true"
                    style={{
                      width: `${frontMatterGeometry.width}mm`,
                      height: `${frontMatterGeometry.height}mm`,
                      padding: '12%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      gap: 12,
                      backgroundColor: cover.backgroundColor || '#1f2933',
                      backgroundImage: cover.imageUrl ? `url(${cover.imageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {cover.title && (
                      <h1 style={{ margin: 0, fontSize: '32px', lineHeight: 1.25, color: cover.textColor || '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,.35)' }}>
                        {cover.title}
                      </h1>
                    )}
                    {cover.subtitle && (
                      <p style={{ margin: 0, fontSize: '15px', color: cover.textColor || '#ffffff', opacity: 0.9, textShadow: '0 2px 10px rgba(0,0,0,.35)' }}>
                        {cover.subtitle}
                      </p>
                    )}
                  </article>
                )}
                {pages.slice(0, summaryInsertAt).map((page, index) => renderChapterPage(page, index))}
                {summary && summaryPages.map(renderSummaryPage)}
                {pages.slice(summaryInsertAt).map((page, index) => renderChapterPage(page, summaryInsertAt + index))}
              </div>
            )}
          </main>
        </div>,
        document.body,
      )}
    </>
  )
}
