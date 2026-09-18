import type { BookSummary } from '@/types'

export interface SummaryEntry {
  id: string
  title: string
  depth: number
  pageNumber?: number
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
  // Índice do primeiro item desta página dentro da lista completa —
  // pra numeração (1, 2, 3...) continuar de onde parou na página
  // anterior, em vez de reiniciar em cada página.
  numberOffset?: number
}

// Renderização do sumário em si — compartilhada entre a prévia real
// do livro (BookPreview, que já sabe o número real de cada página) e
// o editor de modelo (SummaryManager, que só tem números provisórios
// pra mostrar como fica visualmente). A lista de capítulos nunca é
// editada aqui: quem monta `entries` decide o que entra e com que
// número, isso só desenha.
export function BookSummaryView({ summary, entries, showTitle = true, showTextBefore = true, showTextAfter = true, numberOffset = 0 }: BookSummaryViewProps) {
  return (
    <div style={{ fontFamily: summary.fontFamily, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {showTitle && <h2 style={{ margin: '0 0 14px', fontSize: '20px', letterSpacing: '.02em' }}>{summary.title}</h2>}

      {showTextBefore && summary.textBefore && (
        <p style={{ margin: '0 0 16px', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{summary.textBefore}</p>
      )}

      <div style={{ flex: '1 1 auto', minHeight: 0, overflow: 'hidden' }}>
        {entries.length === 0 ? (
          <p style={{ margin: 0, fontSize: '11px', opacity: 0.6 }}>Nenhum capítulo ainda.</p>
        ) : entries.map((entry, index) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 7,
              marginBottom: 7,
              paddingLeft: entry.depth * 14,
              fontSize: '11px',
            }}
          >
            {summary.numbering === 'number' && <span style={{ flexShrink: 0, opacity: 0.75 }}>{numberOffset + index + 1}.</span>}
            {summary.numbering === 'bullet' && <span style={{ flexShrink: 0, opacity: 0.75 }}>•</span>}
            <span style={{ whiteSpace: 'nowrap' }}>{entry.title}</span>
            {summary.showPageNumbers && summary.leaderStyle !== 'none' && (
              <span
                style={{
                  flex: '1 1 auto',
                  minWidth: 8,
                  marginBottom: 3,
                  borderBottom: summary.leaderStyle === 'dots' ? '1.5px dotted currentColor' : '1px solid currentColor',
                  opacity: 0.55,
                }}
              />
            )}
            {summary.showPageNumbers && summary.leaderStyle === 'none' && <span style={{ flex: '1 1 auto' }} />}
            {summary.showPageNumbers && <span style={{ flexShrink: 0 }}>{entry.pageNumber ?? ''}</span>}
          </div>
        ))}
      </div>

      {showTextAfter && summary.textAfter && (
        <p style={{ margin: '16px 0 0', fontSize: '11px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{summary.textAfter}</p>
      )}
    </div>
  )
}
