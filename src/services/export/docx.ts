import type { Paragraph } from 'docx'
import type { Chapter } from '@/types'
import { sortChaptersForReading } from '@/utils/chapterTree'

// Gera o livro num .docx de verdade (editável no Word, LibreOffice,
// Google Docs etc.) — ao contrário do PDF, que é só pra leitura/impressão.
// Não tenta reproduzir a paginação exata do BookPreview (margens,
// grid, cabeçalho/rodapé por página): aqui o objetivo é dar pra
// pessoa continuar editando o texto em outro programa, então cada
// capítulo vira um título + parágrafos comuns, um atrás do outro.
//
// A lib "docx" é pesada, então só é carregada quando alguém realmente
// pede o download (mesmo esquema do jsPDF/html2canvas no PDF).

const DOCX_IMAGE_TYPES = ['jpg', 'png', 'gif', 'bmp'] as const
type DocxImageType = (typeof DOCX_IMAGE_TYPES)[number]

function guessImageType(contentType: string | null, url: string): DocxImageType {
  const fromContentType = contentType?.split('/')[1]?.toLowerCase()
  const candidate = fromContentType === 'jpeg' ? 'jpg' : fromContentType
  if (candidate && (DOCX_IMAGE_TYPES as readonly string[]).includes(candidate)) {
    return candidate as DocxImageType
  }
  const extension = url.split('?')[0].split('.').pop()?.toLowerCase()
  const fromExtension = extension === 'jpeg' ? 'jpg' : extension
  if (fromExtension && (DOCX_IMAGE_TYPES as readonly string[]).includes(fromExtension)) {
    return fromExtension as DocxImageType
  }
  return 'png'
}

// Baixa a imagem pra poder embutir os bytes no .docx — se falhar (ex:
// CORS bloqueando o download da URL do Storage), não trava a geração
// do resto do livro, só avisa no lugar da imagem.
async function fetchImageForDocx(url: string): Promise<{ data: Uint8Array; type: DocxImageType } | null> {
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const buffer = await response.arrayBuffer()
    return { data: new Uint8Array(buffer), type: guessImageType(response.headers.get('content-type'), url) }
  } catch {
    return null
  }
}

function splitParagraphs(content: string): string[] {
  return content
    .replace(/\r\n/g, '\n')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
}

export async function generateBookDocxBlob(chapters: Chapter[], bookTitle?: string): Promise<Blob> {
  const { AlignmentType, Document, HeadingLevel, ImageRun, Packer, Paragraph, TextRun } = await import('docx')

  async function buildImageParagraph(imageUrl: string): Promise<Paragraph> {
    const image = await fetchImageForDocx(imageUrl)
    if (!image) {
      return new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: '[Não foi possível incluir esta imagem no documento]', italics: true })],
      })
    }

    return new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new ImageRun({
          type: image.type,
          data: image.data,
          transformation: { width: 420, height: 594 },
        }),
      ],
    })
  }

  const orderedChapters = sortChaptersForReading(chapters)
  const children: Paragraph[] = []

  if (bookTitle) {
    children.push(new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: bookTitle, bold: true })],
    }))
  }

  for (let index = 0; index < orderedChapters.length; index += 1) {
    const chapter = orderedChapters[index]

    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      pageBreakBefore: index > 0 || Boolean(bookTitle),
      children: [new TextRun({ text: chapter.title, bold: true })],
    }))

    if (chapter.pageType === 'image') {
      if (chapter.pageImageUrl) {
        children.push(await buildImageParagraph(chapter.pageImageUrl))
      } else {
        children.push(new Paragraph({ children: [new TextRun({ text: '[Página de imagem sem imagem definida]', italics: true })] }))
      }
      continue
    }

    const paragraphs = splitParagraphs(chapter.content)
    if (!paragraphs.length) {
      children.push(new Paragraph({ children: [] }))
      continue
    }

    for (const paragraphText of paragraphs) {
      children.push(new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160 },
        indent: { firstLine: 340 },
        children: [new TextRun(paragraphText)],
      }))
    }
  }

  const document = new Document({
    sections: [{ children }],
  })

  return Packer.toBlob(document)
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
