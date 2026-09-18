import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, FileText, LoaderCircle, Printer, X } from 'lucide-react'
import type { BookCover, BookSummary, Chapter, ChapterFooter, ChapterGrid, FooterPosition } from '@/types'
import { getPageFormat } from '@/constants/pageFormats'
import { HeaderPreview } from '@/components/organisms/ChapterHeader/index'
import { BookSummaryView } from '@/components/organisms/BookSummaryView/index'
import type { SummaryEntry } from '@/components/organisms/BookSummaryView/index'
import { chapterDepth, sortChaptersForReading } from '@/utils/chapterTree'
import { downloadBlob, generateBookDocxBlob } from '@/services/export/docx'
import {
  HEADER_CONTENT_GAP_MM,
  MM_TO_PX,
  PT_TO_PX,
  estimateHeaderHeightPx,
  getFooterReserveMm,
  safeFileName,
  splitParagraphs,
} from '@/services/export/layout'
import { bookPreviewCss } from './css'

interface BookPreviewProps {
  chapters: Chapter[]
  activeChapterId: string | null
  bookTitle?: string
  cover?: BookCover
  summary?: BookSummary
}

function hasCoverContent(cover?: BookCover): cover is BookCover {
  return Boolean(cover && (cover.imageUrl || cover.title || cover.subtitle))
}

interface PageParagraph {
  text: string
  continued?: boolean
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

function appendParagraph(box: HTMLDivElement, paragraph: PageParagraph, grid?: ChapterGrid) {
  const element = document.createElement('p')
  element.textContent = paragraph.text
  element.style.margin = '0'
  element.style.marginBottom = `${(grid?.paragraphSpacing ?? 4) * PT_TO_PX}px`
  element.style.textIndent = paragraph.continued ? '0' : `${(grid?.firstLineIndent ?? 0) * MM_TO_PX}px`
  element.style.breakInside = 'avoid-column'
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

function findLargestWordSlice(
  box: HTMLDivElement,
  existing: PageParagraph[],
  words: string[],
  continued: boolean,
  grid?: ChapterGrid,
) {
  let low = 1
  let high = words.length
  let best = 0

  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const candidate = [...existing, { text: words.slice(0, middle).join(' '), continued }]
    if (fits(box, candidate, grid)) {
      best = middle
      low = middle + 1
    } else {
      high = middle - 1
    }
  }

  return best
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

  const paragraphs = splitParagraphs(chapter.content)
  if (!paragraphs.length) {
    return [{ id: `${chapter.id}-0`, chapter, grid, width, height, paragraphs: [], chapterPageIndex: 0, contentHeight: baseContentHeightMm - (chapter.header ? estimateHeaderHeightPx(chapter) / MM_TO_PX + HEADER_CONTENT_GAP_MM : 0), backgroundImageUrl }]
  }

  const pages: PreviewPage[] = []
  let paragraphIndex = 0
  let remainingWords: string[] | null = null
  let isContinuation = false

  while (paragraphIndex < paragraphs.length || remainingWords) {
    const pageIndex = pages.length
    const headerHeightPx = pageIndex === 0 ? estimateHeaderHeightPx(chapter) : 0
    const headerReserveMm = headerHeightPx / MM_TO_PX + (pageIndex === 0 && chapter.header ? HEADER_CONTENT_GAP_MM : 0)
    const contentHeightMm = Math.max(20, baseContentHeightMm - headerReserveMm)
    const box = createMeasureBox(grid, contentWidthMm * MM_TO_PX, contentHeightMm * MM_TO_PX)
    const pageParagraphs: PageParagraph[] = []

    try {
      while (paragraphIndex < paragraphs.length || remainingWords) {
        const words: string[] = remainingWords ?? paragraphs[paragraphIndex].split(/\s+/).filter(Boolean)
        const paragraph: PageParagraph = { text: words.join(' '), continued: isContinuation }
        const candidate = [...pageParagraphs, paragraph]

        if (fits(box, candidate, grid)) {
          pageParagraphs.push(paragraph)
          remainingWords = null
          isContinuation = false
          paragraphIndex += 1
          continue
        }

        const wordCount = findLargestWordSlice(box, pageParagraphs, words, isContinuation, grid)
        if (wordCount > 0) {
          pageParagraphs.push({ text: words.slice(0, wordCount).join(' '), continued: isContinuation })
          remainingWords = words.slice(wordCount)
          isContinuation = true
        } else if (pageParagraphs.length === 0) {
          // Segurança para fontes ou palavras muito grandes: força ao menos uma palavra.
          pageParagraphs.push({ text: words[0], continued: isContinuation })
          remainingWords = words.slice(1)
          isContinuation = true
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

// Mede, numa caixa escondida fora da tela, a altura real (com a fonte
// escolhida) de cada bloco do sumário — título, texto antes/depois e
// uma linha de item — pra saber quantos itens cabem por página. Cada
// item do sumário nunca quebra linha (ver BookSummaryView), então a
// altura de uma única linha de teste já representa a de qualquer item.
function measureSummaryMetrics(summary: BookSummary, contentWidthPx: number) {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-100000px'
  container.style.top = '0'
  container.style.width = `${contentWidthPx}px`
  container.style.visibility = 'hidden'
  container.style.fontFamily = summary.fontFamily
  document.body.appendChild(container)

  // getBoundingClientRect() não inclui margin — mas é exatamente a
  // margem (marginBottom dos títulos/parágrafos/linhas) que separa um
  // bloco do próximo no fluxo normal, então sem somá-la aqui o cálculo
  // de quantas linhas cabem por página fica otimista e a lista acaba
  // sendo cortada (overflow:hidden na página) antes de realmente
  // acabar — sempre incluir a margem é o que faz cada bloco medido
  // representar o espaço vertical que ele realmente ocupa.
  function measure(build: () => HTMLElement) {
    const element = build()
    container.appendChild(element)
    const rect = element.getBoundingClientRect()
    const style = window.getComputedStyle(element)
    const height = rect.height + parseFloat(style.marginTop || '0') + parseFloat(style.marginBottom || '0')
    container.removeChild(element)
    return height
  }

  const titleHeight = measure(() => {
    const heading = document.createElement('h2')
    heading.style.margin = '0 0 14px'
    heading.style.fontSize = '20px'
    heading.style.letterSpacing = '.02em'
    heading.textContent = summary.title || ' '
    return heading
  })

  const textBeforeHeight = summary.textBefore ? measure(() => {
    const paragraph = document.createElement('p')
    paragraph.style.margin = '0 0 16px'
    paragraph.style.fontSize = '11px'
    paragraph.style.lineHeight = '1.6'
    paragraph.style.whiteSpace = 'pre-wrap'
    paragraph.textContent = summary.textBefore ?? ''
    return paragraph
  }) : 0

  const textAfterHeight = summary.textAfter ? measure(() => {
    const paragraph = document.createElement('p')
    paragraph.style.margin = '16px 0 0'
    paragraph.style.fontSize = '11px'
    paragraph.style.lineHeight = '1.6'
    paragraph.style.whiteSpace = 'pre-wrap'
    paragraph.textContent = summary.textAfter ?? ''
    return paragraph
  }) : 0

  const entryRowHeight = measure(() => {
    const row = document.createElement('div')
    row.style.display = 'flex'
    row.style.alignItems = 'baseline'
    row.style.gap = '7px'
    row.style.marginBottom = '7px'
    row.style.fontSize = '11px'
    row.textContent = 'Linha de exemplo'
    return row
  })

  container.remove()
  return { titleHeight, textBeforeHeight, textAfterHeight, entryRowHeight: Math.max(entryRowHeight, 1) }
}

// Distribui os itens do sumário em quantas páginas forem necessárias
// pra caber no espaço real de conteúdo de uma página do livro.
function paginateSummaryEntries(
  summary: BookSummary,
  entries: SummaryEntry[],
  contentWidthPx: number,
  contentHeightPx: number,
): SummaryPageData[] {
  const metrics = measureSummaryMetrics(summary, contentWidthPx)
  const pages: SummaryPageData[] = []
  let remaining = entries
  let isFirst = true

  while (remaining.length > 0 || isFirst) {
    const available = Math.max(0, contentHeightPx - (isFirst ? metrics.titleHeight + metrics.textBeforeHeight : 0))

    let take = Math.min(remaining.length, Math.floor(available / metrics.entryRowHeight))
    if (take === 0 && remaining.length > 0) take = 1 // segurança: sempre avança ao menos 1 item

    const pageEntries = remaining.slice(0, take)
    remaining = remaining.slice(take)

    const isLastEntriesPage = remaining.length === 0
    const leftover = available - take * metrics.entryRowHeight
    const includeTextAfter = isLastEntriesPage && Boolean(summary.textAfter) && leftover >= metrics.textAfterHeight

    pages.push({ entries: pageEntries, showTitle: isFirst, showTextBefore: isFirst, showTextAfter: includeTextAfter })
    isFirst = false

    if (isLastEntriesPage) break
  }

  if (summary.textAfter && !pages.some((page) => page.showTextAfter)) {
    pages.push({ entries: [], showTitle: false, showTextBefore: false, showTextAfter: true })
  }

  return pages
}

export function BookPreview({ chapters, activeChapterId, bookTitle, cover, summary }: BookPreviewProps) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<PreviewPage[]>([])
  const [paginating, setPaginating] = useState(false)
  const [downloadingDocx, setDownloadingDocx] = useState(false)
  // Ordem de leitura do livro: capítulo-pai seguido de seus filhos
  // (aninhados via drag-and-drop na lista lateral), não um simples
  // sort por `order` — esse campo só é único entre irmãos, não global
  // (ver src/utils/chapterTree.ts).
  const orderedChapters = useMemo(() => sortChaptersForReading(chapters), [chapters])

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

      if (summary) {
        const rawEntries: SummaryEntry[] = orderedChapters
          .filter((chapter) => summary.showSubchapters || !chapter.parentId)
          .map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            depth: summary.showSubchapters ? chapterDepth(chapter, chapters) : 0,
          }))

        const contentWidthPx = (frontMatterGeometry.width - frontMatterGeometry.marginLeft - frontMatterGeometry.marginRight) * MM_TO_PX
        const contentHeightPx = (frontMatterGeometry.height - frontMatterGeometry.marginTop - frontMatterGeometry.marginBottom) * MM_TO_PX
        const chunks = paginateSummaryEntries(summary, rawEntries, contentWidthPx, contentHeightPx)

        const frontMatterCount = (hasCoverContent(cover) ? 1 : 0) + chunks.length
        const chapterStartPage = new Map<string, number>()
        chapterPages.forEach((page, index) => {
          if (page.chapterPageIndex === 0 && !chapterStartPage.has(page.chapter.id)) {
            chapterStartPage.set(page.chapter.id, frontMatterCount + index + 1)
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
  }, [open, orderedChapters, chapters, summary, cover, frontMatterGeometry])

  const frontMatterPageCount = (hasCoverContent(cover) ? 1 : 0) + summaryPages.length

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
      const blob = await generateBookDocxBlob(orderedChapters, bookTitle)
      downloadBlob(blob, `${safeFileName(bookTitle)}.docx`)
    } catch (error) {
      console.error('Falha ao gerar DOCX:', error)
      window.alert('Não foi possível gerar o arquivo editável. Tente novamente.')
    } finally {
      setDownloadingDocx(false)
    }
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
                {summary && summaryPages.map((summaryPage, summaryPageIndex) => {
                  const numberOffset = summaryPages.slice(0, summaryPageIndex).reduce((sum, page) => sum + page.entries.length, 0)
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
                        showTitle={summaryPage.showTitle}
                        showTextBefore={summaryPage.showTextBefore}
                        showTextAfter={summaryPage.showTextAfter}
                        numberOffset={numberOffset}
                      />
                    </article>
                  )
                })}
                {pages.map((page, pageIndex) => {
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
                            }}
                          >
                            {paragraph.text}
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
                          <FooterPreview footer={chapter.footer} chapterTitle={chapter.title} pageNumber={frontMatterPageCount + pageIndex + 1} />
                        </div>
                      ) : (
                        <span className={bookPreviewCss.pageNumber}>{frontMatterPageCount + pageIndex + 1}</span>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>,
        document.body,
      )}
    </>
  )
}
