// Glossário + IA: cria o termo e pede ao Gemini o verbete (resumo
// curto, tipo dicionário) a partir do contexto do livro. Usado pelo
// botão direito do editor ("Adicionar ao Glossário") e pela tela
// Estruturas → Glossário ("Gerar com IA").
import { useEffect, useState } from 'react'
import { aiProvider } from '@/services/ai'
import { createGlossaryTerm, subscribeToGlossary, updateGlossaryTerm } from '@/services/firestore/glossary'
import type { BookSection, Chapter, GlossaryTerm } from '@/types'
import { sortChaptersForReading } from '@/utils/chapterTree'
import { stripInline } from '@/utils/inlineFormat'

export interface GlossaryBookContext {
  bookTitle: string
  chapters: Chapter[]
  sections?: BookSection[]
}

// mesmo termo, ignorando maiúsculas e acentos ("Árvore" = "arvore")
export function normalizeTerm(term: string) {
  return term.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()
}

export function findGlossaryTerm(terms: GlossaryTerm[], term: string) {
  const key = normalizeTerm(term)
  return terms.find((item) => normalizeTerm(item.term) === key)
}

// Gera (ou regera) a definição de um termo que já existe e grava no
// Firestore. Em caso de erro, marca o termo com status 'error' pra
// tela do glossário oferecer "tentar de novo".
export async function generateGlossaryDefinition(
  projectId: string,
  termId: string,
  term: string,
  book: GlossaryBookContext,
  context?: string,
) {
  await updateGlossaryTerm(projectId, termId, { status: 'generating' })
  try {
    const definition = await aiProvider.defineGlossaryTerm({
      term,
      bookTitle: book.bookTitle,
      context,
      chapters: sortChaptersForReading(book.chapters, book.sections)
        .filter((chapter) => chapter.pageType !== 'image')
        .map((chapter) => ({ id: chapter.id, title: chapter.title, content: stripInline(chapter.content) })),
    })
    await updateGlossaryTerm(projectId, termId, { definition, status: null })
  } catch (error) {
    console.error('Falha ao gerar definição do glossário:', error)
    await updateGlossaryTerm(projectId, termId, { status: 'error' }).catch(() => undefined)
    throw error
  }
}

// Cria o termo já marcado como "gerando" e dispara a IA (sem esperar:
// quem chamou recebe o id logo, e a definição aparece quando chegar).
export async function addGlossaryTermWithAi(
  projectId: string,
  data: { term: string; context?: string; sourceChapterId?: string },
  book: GlossaryBookContext,
  onDefinitionDone?: (result: { ok: boolean; error?: unknown }) => void,
) {
  const termId = await createGlossaryTerm(projectId, { term: data.term, status: 'generating', sourceChapterId: data.sourceChapterId })
  generateGlossaryDefinition(projectId, termId, data.term, book, data.context)
    .then(() => onDefinitionDone?.({ ok: true }))
    .catch((error) => onDefinitionDone?.({ ok: false, error }))
  return termId
}

// Termos do glossário do projeto, em tempo real
export function useGlossaryTerms(projectId: string | undefined) {
  const [terms, setTerms] = useState<GlossaryTerm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    setLoading(true)
    return subscribeToGlossary(projectId, (next) => {
      setTerms(next)
      setLoading(false)
    })
  }, [projectId])

  return { terms, loading }
}
