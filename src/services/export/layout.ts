import type { Chapter, ChapterFooter } from '@/types'

// Medidas e helpers de layout compartilhados entre a prévia paginada
// (BookPreview, que mede no DOM) e a geração do PDF (que desenha
// direto com jsPDF, sem DOM) — pra manter os dois em sincronia.

export const MM_TO_PX = 96 / 25.4
export const PT_TO_PX = 96 / 72
export const DEFAULT_FOOTER_RESERVE_MM = 9
export const HEADER_CONTENT_GAP_MM = 6

export function getFooterReserveMm(footer?: ChapterFooter) {
  if (!footer) return DEFAULT_FOOTER_RESERVE_MM
  const textHeightMm = footer.fontSize * 0.3528 * 1.4
  const spacingMm = footer.spacingTop / MM_TO_PX
  return Math.max(DEFAULT_FOOTER_RESERVE_MM, textHeightMm + spacingMm + 5)
}

export function estimateHeaderHeightPx(chapter: Chapter): number {
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

export function splitParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export function safeFileName(bookTitle: string | undefined): string {
  return (bookTitle || 'livro')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'livro'
}
