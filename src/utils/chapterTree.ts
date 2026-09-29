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

import type { BookSection } from '@/types'

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

// #region Seções do livro (Sumário, Capítulos, Dedicatória...)
// Id fixo da seção principal: capítulos sem sectionId (todos os
// antigos) caem nela.
export const MAIN_SECTION_ID = 'chapters'
export const SUMMARY_SECTION_ID = 'summary'

// Seções salvas no projeto, garantindo que Sumário e Capítulos existam
// (projetos antigos não têm nenhuma: começam com Sumário acima de
// Capítulos).
export function resolveBookSections(sections?: BookSection[]): BookSection[] {
  const list = [...(sections ?? [])]
  if (!list.some((section) => section.id === MAIN_SECTION_ID)) {
    list.push({ id: MAIN_SECTION_ID, kind: 'chapters', title: 'Capítulos' })
  }
  if (!list.some((section) => section.id === SUMMARY_SECTION_ID)) {
    const mainIndex = list.findIndex((section) => section.id === MAIN_SECTION_ID)
    list.splice(mainIndex, 0, { id: SUMMARY_SECTION_ID, kind: 'summary', title: 'Sumário' })
  }
  return list
}

// Dedicatória fica fora do sumário por padrão; o resto entra.
export function sectionShowsInSummary(section: BookSection) {
  if (section.kind === 'summary') return false
  return section.showInSummary ?? section.kind !== 'dedication'
}

// Seção de um capítulo: a do capítulo raiz da sua árvore (os
// aninhados herdam). sectionId apontando pra seção que não existe
// mais cai na principal.
export function chapterSectionId<T extends ChapterLike & { sectionId?: string }>(
  chapter: T,
  chapters: T[],
  sections?: BookSection[],
): string {
  const byId = new Map(chapters.map((item) => [item.id, item]))
  const visited = new Set<string>()
  let root = chapter
  while (root.parentId && !visited.has(root.id)) {
    visited.add(root.id)
    const parent = byId.get(root.parentId)
    if (!parent) break
    root = parent
  }
  const sectionId = root.sectionId ?? MAIN_SECTION_ID
  if (sections && !sections.some((section) => section.id === sectionId && section.kind !== 'summary')) return MAIN_SECTION_ID
  return sectionId
}
// #endregion

// Retorna os capítulos na ordem de leitura do livro: cada capítulo-pai
// seguido imediatamente por seus filhos (também em ordem), antes do
// próximo irmão do pai. Com `sections`, os capítulos raiz vão seção
// por seção, na ordem das seções.
export function sortChaptersForReading<T extends ChapterLike & { sectionId?: string }>(chapters: T[], sections?: BookSection[]): T[] {
  const childrenByParent = groupChaptersByParent(chapters)
  const ordered: T[] = []

  function visit(parentId: string | undefined) {
    for (const chapter of childrenByParent.get(parentId) ?? []) {
      ordered.push(chapter)
      visit(chapter.id)
    }
  }

  if (!sections) {
    visit(undefined)
    return ordered
  }

  const resolved = resolveBookSections(sections)
  const roots = childrenByParent.get(undefined) ?? []
  for (const section of resolved) {
    for (const root of roots) {
      if (chapterSectionId(root, chapters, resolved) !== section.id) continue
      ordered.push(root)
      visit(root.id)
    }
  }
  return ordered
}

// Nível de aninhamento de um capítulo (0 = raiz, 1 = filho direto,
// etc.) — usado pra recuar sub-capítulos no sumário. `visited` evita
// loop infinito no caso (não deveria acontecer, mas por segurança) de
// um parentId apontar pra um ciclo.
export function chapterDepth<T extends ChapterLike>(chapter: T, chapters: T[]): number {
  const byId = new Map(chapters.map((item) => [item.id, item]))
  const visited = new Set<string>()
  let depth = 0
  let current: T | undefined = chapter

  while (current?.parentId && !visited.has(current.id)) {
    visited.add(current.id)
    current = byId.get(current.parentId)
    depth++
  }

  return depth
}
