import { useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, Download, LoaderCircle, X } from 'lucide-react'
import type { Chapter, ChapterFooter, ChapterGrid, FooterPosition } from '@/types'
import { getPageFormat } from '@/constants/pageFormats'
import { HeaderPreview } from '@/components/organisms/ChapterHeader/index'
import { bookPreviewCss } from './css'

interface BookPreviewProps {
  chapters: Chapter[]
  activeChapterId: string | null
  bookTitle?: string
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
}

const MM_TO_PX = 96 / 25.4
const PT_TO_PX = 96 / 72
const DEFAULT_FOOTER_RESERVE_MM = 9
const HEADER_CONTENT_GAP_MM = 6

function getFooterReserveMm(footer?: ChapterFooter) {
  if (!footer) return DEFAULT_FOOTER_RESERVE_MM
  const textHeightMm = footer.fontSize * 0.3528 * 1.4
  const spacingMm = footer.spacingTop / MM_TO_PX
  return Math.max(DEFAULT_FOOTER_RESERVE_MM, textHeightMm + spacingMm + 5)
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

function splitParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

function estimateHeaderHeightPx(chapter: Chapter): number {
  const header = chapter.header
  if (!header) return 0

  const hasImage = header.layout === 'image-text' || header.layout === 'image-only'
  const hasPrimaryText = header.layout !== 'image-only'
  const hasSecondaryText = header.layout === 'text-text'
  const visibleRows = Number(hasImage) + Number(hasPrimaryText) + Number(hasSecondaryText)
  const gaps = Math.max(0, visibleRows - 1) * header.rowGap
  const imageHeight = hasImage ? header.imageHeight : 0
  const primaryHeight = hasPrimaryText ? header.fontSize * 1.25 + header.textStartSpacing : 0
  const secondaryHeight = hasSecondaryText ? header.secondaryFontSize * 1.25 : 0
  const borders = (header.borderTop ? 9 : 0) + (header.borderBottom ? 9 : 0)

  return imageHeight + primaryHeight + secondaryHeight + gaps + borders
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
  const contentWidthMm = width - (grid?.marginLeft ?? 16) - (grid?.marginRight ?? 16)
  const baseContentHeightMm = height
    - (grid?.marginTop ?? 18)
    - (grid?.marginBottom ?? 20)
    - getFooterReserveMm(chapter.footer)

  const paragraphs = splitParagraphs(chapter.content)
  if (!paragraphs.length) {
    return [{ id: `${chapter.id}-0`, chapter, grid, width, height, paragraphs: [], chapterPageIndex: 0, contentHeight: baseContentHeightMm - (chapter.header ? estimateHeaderHeightPx(chapter) / MM_TO_PX + HEADER_CONTENT_GAP_MM : 0) }]
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
    })
  }

  return pages
}

export function BookPreview({ chapters, activeChapterId, bookTitle }: BookPreviewProps) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<PreviewPage[]>([])
  const [paginating, setPaginating] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const bookRef = useRef<HTMLDivElement>(null)
  const orderedChapters = useMemo(() => [...chapters].sort((a, b) => a.order - b.order), [chapters])

  useEffect(() => {
    if (!open) return
    setPaginating(true)
    const frame = window.requestAnimationFrame(() => {
      setPages(orderedChapters.flatMap(paginateChapter))
      setPaginating(false)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, orderedChapters])

  async function downloadPdf() {
    if (!bookRef.current || paginating || !pages.length || downloadingPdf) return

    setDownloadingPdf(true)
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])
      const pageElements = Array.from(
        bookRef.current.querySelectorAll<HTMLElement>('[data-book-page="true"]'),
      )

      if (!pageElements.length) return

      let pdf: InstanceType<typeof jsPDF> | null = null

      for (let index = 0; index < pageElements.length; index += 1) {
        const page = pages[index]
        const element = pageElements[index]
        const orientation = page.width > page.height ? 'landscape' : 'portrait'

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const image = canvas.toDataURL('image/jpeg', 0.96)

        if (!pdf) {
          pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: [page.width, page.height],
            compress: true,
          })
        } else {
          pdf.addPage([page.width, page.height], orientation)
        }

        pdf.addImage(image, 'JPEG', 0, 0, page.width, page.height, undefined, 'FAST')
      }

      const safeTitle = (bookTitle || 'livro')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'livro'

      pdf?.save(`${safeTitle}.pdf`)
    } catch (error) {
      console.error('Falha ao gerar PDF:', error)
      window.alert('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  return (
    <>
      <button className={bookPreviewCss.trigger} type="button" onClick={() => setOpen(true)} title="Visualizar o livro paginado">
        <BookOpen size={15} />
        <span>Visualizar livro</span>
      </button>

      {open && (
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
                onClick={() => void downloadPdf()}
                disabled={paginating || !pages.length || downloadingPdf}
                title="Baixar livro em PDF"
              >
                {downloadingPdf ? <LoaderCircle className={bookPreviewCss.spinner} size={16} /> : <Download size={16} />}
                <span>{downloadingPdf ? 'Gerando PDF...' : 'Baixar PDF'}</span>
              </button>
              <button className={bookPreviewCss.close} type="button" onClick={() => setOpen(false)} aria-label="Fechar visualização"><X size={18} /></button>
            </div>
          </header>

          <main className={bookPreviewCss.viewport}>
            {paginating ? <div className={bookPreviewCss.empty}>Formatando e separando as páginas...</div> : pages.length === 0 ? (
              <div className={bookPreviewCss.empty}>Nenhum capítulo para visualizar.</div>
            ) : (
              <div className={bookPreviewCss.book} ref={bookRef}>
                {pages.map((page, pageIndex) => {
                  const { chapter, grid } = page
                  const isFirstChapterPage = page.chapterPageIndex === 0
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
                        )) : <p>Este capítulo ainda não possui texto.</p>}
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
                          <FooterPreview footer={chapter.footer} chapterTitle={chapter.title} pageNumber={pageIndex + 1} />
                        </div>
                      ) : (
                        <span className={bookPreviewCss.pageNumber}>{pageIndex + 1}</span>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      )}
    </>
  )
}
