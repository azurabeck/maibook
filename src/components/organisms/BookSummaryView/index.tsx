import { useLayoutEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { BookSection, BookSummary, SummaryTextAlign } from '@/types'
import { chapterDepth, chapterSectionId, resolveBookSections, sectionShowsInSummary, sortChaptersForReading } from '@/utils/chapterTree'

export interface SummaryEntry {
  id: string
  title: string
  depth: number
  pageNumber?: number
  isGroup?: boolean // agrupamento destacado ("Parte um..."): título de seção, sem número nem página
  number?: number // posição na numeração (1., 2., •) — ausente = sem número
}

interface BookSummaryViewProps {
  summary: BookSummary
  entries: SummaryEntry[]
  // Quando o sumário é desenhado em várias páginas (BookPreview), cada
  // uma só recebe título/texto antes/depois quando fizer sentido nela
  // — por padrão (usado pela prévia de uma página só do SummaryManager)
  // os três aparecem sempre.
  showTitle?: boolean
  showTextBefore?: boolean
  showTextAfter?: boolean
  // 2 colunas: índice do primeiro item da coluna da direita (a
  // paginação do BookPreview calcula; sem ele, divide ao meio)
  columnBreak?: number
  // Editor do sumário: clicar num trecho (título, agrupamento,
  // capítulo) abre os controles dele
  onEditPart?: (part: SummaryPart) => void
  activePart?: SummaryPart | null
}

export type SummaryPart = 'title' | 'group' | 'entry'

const PART_LABELS: Record<SummaryPart, string> = { title: 'título do sumário', group: 'título do agrupamento', entry: 'texto do capítulo' }

// Divide a lista ao meio pras 2 colunas, sem deixar título de
// agrupamento sozinho no fim da coluna da esquerda.
function splitColumns(entries: SummaryEntry[]) {
  let breakAt = Math.ceil(entries.length / 2)
  while (breakAt > 1 && entries[breakAt - 1]?.isGroup) breakAt -= 1
  return breakAt
}

interface ResolvedTextStyle {
  fontFamily: string
  fontSize: number
  bold: boolean
  italic: boolean
  align: SummaryTextAlign
  divider: boolean
}

// Estilo completo de cada parte do sumário: o que o modelo não define
// cai no padrão — que é exatamente a aparência dos sumários antigos.
export function resolveSummaryStyle(summary: BookSummary) {
  const base = summary.fontFamily
  const resolve = (style: BookSummary['titleStyle'], defaults: Omit<ResolvedTextStyle, 'fontFamily'>): ResolvedTextStyle => ({
    fontFamily: style?.fontFamily || base,
    fontSize: style?.fontSize ?? defaults.fontSize,
    bold: style?.bold ?? defaults.bold,
    italic: style?.italic ?? defaults.italic,
    align: style?.align ?? defaults.align,
    divider: style?.divider ?? defaults.divider,
  })

  return {
    title: resolve(summary.titleStyle, { fontSize: 20, bold: true, italic: false, align: 'left', divider: false }),
    group: resolve(summary.groupStyle, { fontSize: 12, bold: true, italic: false, align: 'left', divider: false }),
    entry: resolve(summary.entryStyle, { fontSize: 11, bold: false, italic: false, align: 'left', divider: false }),
    titleSpacingTop: summary.titleSpacingTop ?? 0,
    titleSpacingBottom: summary.titleSpacingBottom ?? 14,
    groupSpacingTop: summary.groupSpacingTop ?? 10,
    groupSpacingBottom: summary.groupSpacingBottom ?? 7,
    entrySpacing: summary.entrySpacing ?? 7,
    columnGap: summary.columnGap ?? 24,
  }
}

// Posiciona o pontilhado/linha de um item: começa logo depois do fim
// da ÚLTIMA linha do título e vai até o número da página, na altura da
// linha de base do texto. Medido no DOM porque o título pode quebrar em
// várias linhas — e assim o pontilhado nunca passa por baixo/por cima
// do texto (não depende de fundo cobrindo nada, então sai igual na tela,
// na impressão e no PDF).
function placeLeader(leader: HTMLElement) {
  const row = leader.parentElement
  const title = row?.querySelector<HTMLElement>('[data-summary-title]')
  const page = row?.querySelector<HTMLElement>('[data-summary-page]')
  if (!row || !title) return

  const rects = title.getClientRects()
  const last = rects[rects.length - 1]
  const rowRect = row.getBoundingClientRect()
  if (!last || !rowRect.width) return

  // prévias em escala reduzida (CSS zoom): mede quanto 1000px do
  // próprio pontilhado ocupam na tela pra converter px da tela em px dele
  leader.style.left = '0px'
  leader.style.width = '1000px'
  const scale = leader.getBoundingClientRect().width / 1000 || 1

  const fontSize = parseFloat(window.getComputedStyle(title).fontSize) || 11
  const gap = fontSize * 0.35
  const left = (last.right - rowRect.left) / scale + gap
  const right = page ? (rowRect.right - page.getBoundingClientRect().left) / scale + gap : 0
  const width = rowRect.width / scale - left - right

  leader.style.left = `${left}px`
  leader.style.width = `${Math.max(0, width)}px`
  // linha de base ≈ fim da linha menos a parte de baixo das letras (descendentes)
  leader.style.bottom = `${(rowRect.bottom - last.bottom) / scale + fontSize * 0.28}px`
  leader.style.visibility = width >= fontSize * 0.6 ? 'visible' : 'hidden'
}

function textStyle(style: ResolvedTextStyle): CSSProperties {
  return {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.bold ? 700 : 400,
    fontStyle: style.italic ? 'italic' : 'normal',
  }
}

// Monta a lista do sumário a partir dos capítulos, na ordem de
// leitura. `pageNumbers` vem da paginação real (BookPreview); sem ela,
// os números são só ilustrativos (prévia do SummaryManager). Com
// `sections`, segue a ordem das seções do livro e deixa de fora as
// que não aparecem no sumário (ex.: dedicatória).
export function buildSummaryEntries(
  chapters: { id: string; title: string; parentId?: string; order: number; sectionId?: string }[],
  summary: BookSummary,
  pageNumbers?: Map<string, number>,
  sections?: BookSection[],
): SummaryEntry[] {
  const resolvedSections = sections ? resolveBookSections(sections) : undefined
  const hiddenSections = new Set((resolvedSections ?? []).filter((section) => !sectionShowsInSummary(section)).map((section) => section.id))
  // Só as páginas das seções de capítulos entram na numeração (1., 2.,
  // 3....): prólogo, epílogo, glossário etc. aparecem sem número.
  const sectionKinds = new Map((resolvedSections ?? []).map((section) => [section.id, section.kind]))
  const countsAsChapter = (chapter: (typeof chapters)[number]) =>
    !resolvedSections || sectionKinds.get(chapterSectionId(chapter, chapters, resolvedSections)) === 'chapters'
  const parentIds = new Set(chapters.map((chapter) => chapter.parentId).filter(Boolean))
  const highlightGroups = Boolean(summary.highlightGroups && summary.showSubchapters)
  let counter = 0

  return sortChaptersForReading(chapters, resolvedSections)
    .filter((chapter) => !resolvedSections || !hiddenSections.has(chapterSectionId(chapter, chapters, resolvedSections)))
    .filter((chapter) => summary.showSubchapters || !chapter.parentId)
    .map((chapter, index) => {
      const isGroup = highlightGroups && parentIds.has(chapter.id)
      const numbered = summary.numbering !== 'none' && !isGroup && countsAsChapter(chapter)
        && (!summary.numberGroupedOnly || Boolean(chapter.parentId))
      return {
        id: chapter.id,
        title: chapter.title,
        // com agrupamentos destacados, os capítulos dentro deles não recuam
        depth: summary.showSubchapters && !highlightGroups ? chapterDepth(chapter, chapters) : 0,
        pageNumber: pageNumbers ? pageNumbers.get(chapter.id) : index + 1,
        isGroup,
        number: numbered ? ++counter : undefined,
      }
    })
}

// Renderização do sumário em si — compartilhada entre a prévia real
// do livro (BookPreview, que já sabe o número real de cada página) e
// o editor de modelo (SummaryManager, que só tem números provisórios
// pra mostrar como fica visualmente). A lista de capítulos nunca é
// editada aqui: quem monta `entries` decide o que entra e com que
// número, isso só desenha. Os blocos são marcados com
// data-summary-part pra paginação do BookPreview medir cada um.
export function BookSummaryView({
  summary,
  entries,
  showTitle = true,
  showTextBefore = true,
  showTextAfter = true,
  columnBreak,
  onEditPart,
  activePart,
}: BookSummaryViewProps) {
  const style = resolveSummaryStyle(summary)
  const twoColumns = summary.columns === 2

  // No editor, cada trecho vira clicável (com a canetinha no hover)
  const editable = (part: SummaryPart) => onEditPart ? {
    className: activePart === part ? 'summary-editable-part summary-editable-part--active' : 'summary-editable-part',
    title: `Editar ${PART_LABELS[part]}`,
    onClick: () => onEditPart(part),
  } : {}

  const hasMarker = (entry: SummaryEntry) => summary.numbering !== 'none' && entry.number !== undefined

  const renderRow = (entry: SummaryEntry) => entry.isGroup ? (
    <div
      key={entry.id}
      data-summary-part="row"
      {...editable('group')}
      style={{
        ...textStyle(style.group),
        flexShrink: 0,
        margin: `${style.groupSpacingTop}px 0 ${style.groupSpacingBottom}px`,
        textAlign: style.group.align,
        lineHeight: 1.3,
        paddingBottom: style.group.divider ? 4 : 0,
        borderBottom: style.group.divider ? '1px solid currentColor' : 'none',
      }}
    >
      {entry.title}
    </div>
  ) : (
    <div
      key={entry.id}
      data-summary-part="row"
      {...editable('entry')}
      // Título longo quebra em mais de uma linha, como no livro impresso:
      // o número do capítulo fica pendurado à esquerda da 1ª linha e o
      // pontilhado + número da página acompanham a última linha (o
      // pontilhado é posicionado por placeLeader, depois de medir o título).
      style={{
        ...textStyle(style.entry),
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        margin: `0 0 ${style.entrySpacing}px`,
        paddingLeft: `calc(${entry.depth * 14}px + ${hasMarker(entry) ? '1.9em' : '0px'})`,
        paddingRight: summary.showPageNumbers ? '2.2em' : 0,
        lineHeight: 1.35,
      }}
    >
      {/* largura fixa pro número: "9." e "10." alinham o título no mesmo ponto */}
      {hasMarker(entry) && (
        <span style={{ position: 'absolute', left: entry.depth * 14, top: 0, opacity: 0.75 }}>
          {summary.numbering === 'number' ? `${entry.number}.` : '•'}
        </span>
      )}
      <span data-summary-title="" style={{ overflowWrap: 'anywhere' }}>{entry.title}</span>
      {summary.showPageNumbers && summary.leaderStyle !== 'none' && (
        <span
          aria-hidden="true"
          data-summary-leader=""
          style={{
            position: 'absolute',
            height: 0,
            visibility: 'hidden', // até placeLeader medir o título
            borderBottom: summary.leaderStyle === 'dots' ? '1.5px dotted currentColor' : '1px solid currentColor',
            opacity: 0.55,
          }}
        />
      )}
      {summary.showPageNumbers && (
        <span data-summary-page="" style={{ position: 'absolute', right: 0, bottom: 0 }}>{entry.pageNumber ?? ''}</span>
      )}
    </div>
  )

  // coluna flex: as margens dos itens não se somam/colapsam, então a
  // altura de cada item medido é exatamente a que ele ocupa
  const column = (items: SummaryEntry[], key: string) => (
    <div key={key} style={{ flex: '1 1 0', minWidth: 0, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {items.map(renderRow)}
    </div>
  )

  const breakAt = columnBreak ?? splitColumns(entries)

  // Reposiciona os pontilhados depois de cada renderização, quando as
  // fontes terminam de carregar e quando a largura muda.
  const rootRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const placeAll = () => root.querySelectorAll<HTMLElement>('[data-summary-leader]').forEach(placeLeader)
    placeAll()
    let active = true
    void document.fonts?.ready.then(() => { if (active) placeAll() })
    const observer = new ResizeObserver(placeAll)
    observer.observe(root)
    return () => {
      active = false
      observer.disconnect()
    }
  })

  return (
    <div ref={rootRef} style={{ fontFamily: summary.fontFamily, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showTitle && (
        <h2
          data-summary-part="title"
          {...editable('title')}
          style={{
            ...textStyle(style.title),
            margin: `${style.titleSpacingTop}px 0 ${style.titleSpacingBottom}px`,
            textAlign: style.title.align,
            letterSpacing: '.02em',
            lineHeight: 1.25,
            paddingBottom: style.title.divider ? 6 : 0,
            borderBottom: style.title.divider ? '1px solid currentColor' : 'none',
          }}
        >
          {summary.title}
        </h2>
      )}

      {showTextBefore && summary.textBefore && (
        <p data-summary-part="before" style={{ margin: '0 0 16px', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{summary.textBefore}</p>
      )}

      {entries.length === 0 ? (
        <p style={{ margin: 0, fontSize: '11px', opacity: 0.6, flex: '1 1 auto' }}>Nenhum capítulo ainda.</p>
      ) : twoColumns ? (
        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', display: 'flex', gap: style.columnGap }}>
          {column(entries.slice(0, breakAt), 'left')}
          {column(entries.slice(breakAt), 'right')}
        </div>
      ) : (
        <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {entries.map(renderRow)}
        </div>
      )}

      {showTextAfter && summary.textAfter && (
        <p data-summary-part="after" style={{ margin: '16px 0 0', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{summary.textAfter}</p>
      )}
    </div>
  )
}
