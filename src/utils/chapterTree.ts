// Ordenação hierárquica de capítulos.
//
// `chapter.order` só é único ENTRE IRMÃOS (mesmo parentId) — não é um
// índice global (ver comentário em src/types/index.ts). Por isso NUNCA
// dá pra pegar a lista de capítulos e só fazer `.sort((a, b) => a.order
// - b.order)`: dois capítulos com pais diferentes podem ter o mesmo
// `order`, e a ordem de leitura de um capítulo aninhado é sempre
// "logo depois do pai", não "onde o número dele cair no meio dos
// outros". A árvore inteira precisa ser reconstruída (agrupar por
// parentId, ordenar cada grupo, percorrer em profundidade) pra chegar
// na ordem real de leitura do livro.
//
// Usado tanto pelo ChapterListPanel (lista lateral, com suporte a
// recolher capítulos-pai) quanto pelo BookPreview (paginação do livro,
// que sempre quer todos os capítulos, sem recolhimento).

export interface ChapterLike {
  id: string
  order: number
  parentId?: string
}

// Agrupa os capítulos por parentId (chave `undefined` = raiz) e ordena
// cada grupo de irmãos por `order`. Base tanto de `sortChaptersForReading`
// quanto da árvore renderizada pelo ChapterListPanel.
export function groupChaptersByParent<T extends ChapterLike>(chapters: T[]): Map<string | undefined, T[]> {
  const childrenByParent = new Map<string | undefined, T[]>()
  for (const chapter of chapters) {
    const key = chapter.parentId ?? undefined
    const siblings = childrenByParent.get(key)
    if (siblings) siblings.push(chapter)
    else childrenByParent.set(key, [chapter])
  }
  for (const siblings of childrenByParent.values()) siblings.sort((a, b) => a.order - b.order)
  return childrenByParent
}

// Retorna os capítulos na ordem de leitura do livro: cada capítulo-pai
// seguido imediatamente por seus filhos (também em ordem), antes do
// próximo irmão do pai.
export function sortChaptersForReading<T extends ChapterLike>(chapters: T[]): T[] {
  const childrenByParent = groupChaptersByParent(chapters)
  const ordered: T[] = []

  function visit(parentId: string | undefined) {
    for (const chapter of childrenByParent.get(parentId) ?? []) {
      ordered.push(chapter)
      visit(chapter.id)
    }
  }

  visit(undefined)
  return ordered
}
