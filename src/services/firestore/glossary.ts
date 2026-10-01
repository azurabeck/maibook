// Camada de acesso a dados do GLOSSÁRIO no Firestore.
//
// Os termos ficam num mapa dentro do próprio documento do projeto
// (projects/{projectId}.glossary.{termId}), e não numa subcoleção:
// assim valem as mesmas regras de segurança do projeto, sem precisar
// publicar regra nova no Firebase. Cada termo é gravado pelo caminho
// "glossary.<id>", então editar um termo nunca sobrescreve os outros
// (ex.: a IA terminando uma definição enquanto outro termo é editado).
import { deleteField, doc, onSnapshot, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { GlossaryTerm } from '@/types'

type StoredTerm = Omit<GlossaryTerm, 'id' | 'projectId'>

function projectDoc(projectId: string) {
  return doc(db, 'projects', projectId)
}

// id só com letras/números (vira parte do caminho do campo)
function newTermId() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

// Termos em ordem alfabética (acentos e maiúsculas na ordem do português)
export function subscribeToGlossary(projectId: string, onChange: (terms: GlossaryTerm[]) => void) {
  return onSnapshot(projectDoc(projectId), (snapshot) => {
    const stored = (snapshot.data()?.glossary ?? {}) as Record<string, StoredTerm>
    // restos sem termo (ex.: a IA terminou depois de o termo ser
    // apagado e gravou só a definição) não aparecem e são limpos
    const entries = Object.entries(stored)
    const orphans = entries.filter(([, term]) => typeof term?.term !== 'string').map(([id]) => id)
    if (orphans.length) {
      void updateDoc(projectDoc(projectId), Object.fromEntries(orphans.map((id) => [`glossary.${id}`, deleteField()])))
        .catch(() => undefined)
    }
    const terms = entries
      .filter(([, term]) => typeof term?.term === 'string')
      .map(([id, term]) => ({ ...term, id, projectId }))
    onChange(terms.sort((a, b) => a.term.localeCompare(b.term, 'pt-BR', { sensitivity: 'base' })))
  })
}

export async function createGlossaryTerm(
  projectId: string,
  data: { term: string; definition?: string; status?: GlossaryTerm['status']; sourceChapterId?: string },
) {
  const now = Date.now()
  const id = newTermId()
  const stored: StoredTerm = {
    term: data.term.trim(),
    definition: data.definition?.trim() ?? '',
    ...(data.status ? { status: data.status } : {}),
    ...(data.sourceChapterId ? { sourceChapterId: data.sourceChapterId } : {}),
    createdAt: now,
    updatedAt: now,
  }
  await updateDoc(projectDoc(projectId), { [`glossary.${id}`]: stored })
  return id
}

// Atualiza termo e/ou definição. status: null tira o marcador de
// "gerando"/"erro".
export async function updateGlossaryTerm(
  projectId: string,
  termId: string,
  data: { term?: string; definition?: string; status?: GlossaryTerm['status'] | null },
) {
  const path = `glossary.${termId}`
  await updateDoc(projectDoc(projectId), {
    ...(data.term !== undefined ? { [`${path}.term`]: data.term.trim() } : {}),
    ...(data.definition !== undefined ? { [`${path}.definition`]: data.definition.trim() } : {}),
    ...(data.status !== undefined ? { [`${path}.status`]: data.status ?? deleteField() } : {}),
    [`${path}.updatedAt`]: Date.now(),
  })
}

export async function deleteGlossaryTerm(projectId: string, termId: string) {
  await updateDoc(projectDoc(projectId), { [`glossary.${termId}`]: deleteField() })
}
