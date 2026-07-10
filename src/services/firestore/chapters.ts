// Camada de acesso a dados dos CAPÍTULOS no Firestore.
//
// Decisão de modelagem: cada capítulo vive numa SUBCOLEÇÃO dentro do
// próprio projeto -> projects/{projectId}/chapters/{chapterId}.
// Por quê subcoleção em vez de uma coleção "chapters" solta na raiz
// com um campo projectId?
//   - O relacionamento "capítulo pertence a um projeto" já fica
//     garantido pela própria estrutura de pastas do Firestore (não dá
//     nem pra criar um capítulo "solto" sem projeto).
//   - Fica mais barato de proteger com Security Rules: dá pra checar
//     "o dono do projeto pai é o usuário logado?" numa regra só, sem
//     precisar validar um campo projectId manualmente em cada doc.
//   - As buscas que a gente faz (todos os capítulos DE UM projeto)
//     são exatamente o caso de uso ideal de subcoleção.
// O type `Chapter` continua tendo `projectId` — usamos esse campo em
// memória (no client) mesmo ele não sendo salvo dentro do doc do
// Firestore, já que o caminho da subcoleção já carrega essa info.

import { addDoc, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, query, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Chapter, ChapterGrid, ChapterHeader } from '@/types'

function chaptersCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'chapters')
}

function chapterDoc(projectId: string, chapterId: string) {
  return doc(db, 'projects', projectId, 'chapters', chapterId)
}

// Escuta em tempo real a lista de capítulos de um projeto, sempre
// ordenada pelo campo "order". Retorna a função de unsubscribe.
export function subscribeToChapters(
  projectId: string,
  onChange: (chapters: Chapter[]) => void,
) {
  const q = query(chaptersCollection(projectId), orderBy('order'))

  return onSnapshot(q, (snapshot) => {
    const chapters = snapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, projectId, ...docSnap.data() }) as Chapter,
    )
    onChange(chapters)
  })
}

// Cria um capítulo novo dentro do projeto e devolve o id gerado.
export async function createChapter(projectId: string, order: number, title: string) {
  const docRef = await addDoc(chaptersCollection(projectId), {
    title,
    order,
    content: '',
  })
  return docRef.id
}

export async function renameChapterInFirestore(
  projectId: string,
  chapterId: string,
  title: string,
) {
  await updateDoc(chapterDoc(projectId, chapterId), { title })
}

// Salva o conteúdo (texto) do capítulo. Quem chama essa função deve
// aplicar debounce antes — ver useProjectStore.ts — pra não disparar
// uma escrita no Firestore a cada tecla digitada.
export async function updateChapterContentInFirestore(
  projectId: string,
  chapterId: string,
  content: string,
) {
  await updateDoc(chapterDoc(projectId, chapterId), { content })
}


export async function updateChapterHeaderInFirestore(
  projectId: string,
  chapterId: string,
  header: ChapterHeader | null,
) {
  await updateDoc(chapterDoc(projectId, chapterId), {
    header: header ?? deleteField(),
  })
}

export async function updateChapterGridInFirestore(
  projectId: string,
  chapterId: string,
  grid: ChapterGrid | null,
) {
  await updateDoc(chapterDoc(projectId, chapterId), {
    grid: grid ?? deleteField(),
  })
}

export async function updateAllChaptersGridInFirestore(
  projectId: string,
  chapterIds: string[],
  grid: ChapterGrid,
) {
  const batch = writeBatch(db)
  chapterIds.forEach((chapterId) => batch.update(chapterDoc(projectId, chapterId), { grid }))
  await batch.commit()
}

export async function deleteChapterInFirestore(projectId: string, chapterId: string) {
  await deleteDoc(chapterDoc(projectId, chapterId))
}
