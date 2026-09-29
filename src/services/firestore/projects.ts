// Camada de acesso a dados dos PROJETOS (livros) no Firestore.
// Centralizamos as queries aqui — as páginas/componentes não devem
// importar `firebase/firestore` diretamente, só essas funções.
// Isso deixa o resto do app "ignorante" sobre o formato exato das
// queries, e facilita trocar/ajustar o backend no futuro.

import {
  addDoc,
  collection,
  deleteField,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { BookCover, BookProject, BookSection, BookSummary, ChapterOrderAnalysis, CharacterDetectionAnalysis, LocationDetectionAnalysis, StoryTimelineAnalysis } from '@/types'

const PROJECTS_COLLECTION = 'projects'

// Escuta em tempo real todos os projetos de um usuário (usado no Dashboard).
// Retorna a função de "unsubscribe" — quem chamar precisa executá-la
// ao desmontar o componente, senão o listener fica vivo pra sempre.
export function subscribeToUserProjects(
  ownerId: string,
  onChange: (projects: BookProject[]) => void,
) {
  const q = query(collection(db, PROJECTS_COLLECTION), where('ownerId', '==', ownerId))

  return onSnapshot(q, (snapshot) => {
    const projects = snapshot.docs.map(
      (docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as BookProject,
    )
    onChange(projects)
  })
}

// Escuta em tempo real UM projeto específico (usado ao entrar em /projeto/:id).
// Chama onChange(null) se o documento não existir (ex: id errado ou
// projeto deletado), pra quem estiver ouvindo poder redirecionar.
export function subscribeToProject(
  projectId: string,
  onChange: (project: BookProject | null) => void,
) {
  const ref = doc(db, PROJECTS_COLLECTION, projectId)

  return onSnapshot(ref, (snapshot) => {
    if (!snapshot.exists()) {
      onChange(null)
      return
    }
    onChange({ id: snapshot.id, ...snapshot.data() } as BookProject)
  })
}

// Cria um projeto novo já vinculado ao uid do dono. Retorna o id
// gerado pelo Firestore, pra quem chamou poder navegar direto pra ele.
export async function createProject(ownerId: string, title = 'Novo livro sem título') {
  const newProject: Omit<BookProject, 'id'> = {
    ownerId,
    title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }

  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), newProject)
  return docRef.id
}

export async function renameProject(projectId: string, title: string) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    title,
    updatedAt: Date.now(),
  })
}

// Atualiza só o "updatedAt" — útil pra marcar que o projeto teve
// atividade recente (ex: toda vez que um capítulo é salvo).
export async function touchProject(projectId: string) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), { updatedAt: Date.now() })
}

export async function updateChapterOrderAnalysis(projectId: string, chapterOrderAnalysis: ChapterOrderAnalysis) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), { chapterOrderAnalysis, updatedAt: Date.now() })
}

export async function updateStoryTimelineAnalysis(projectId: string, storyTimelineAnalysis: StoryTimelineAnalysis) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), { storyTimelineAnalysis, updatedAt: Date.now() })
}

// Guarda a última lista de personagens que a IA encontrou no
// manuscrito mas o autor ainda não adicionou — assim o resultado
// sobrevive a um F5/navegação e não precisa rodar a IA de novo.
export async function updateCharacterDetectionAnalysis(
  projectId: string,
  characterDetectionAnalysis: CharacterDetectionAnalysis,
) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), { characterDetectionAnalysis, updatedAt: Date.now() })
}

// Mesma ideia, mas pra lugares encontrados no manuscrito que ainda
// não foram cadastrados na aba Lugares.
export async function updateLocationDetectionAnalysis(
  projectId: string,
  locationDetectionAnalysis: LocationDetectionAnalysis,
) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), { locationDetectionAnalysis, updatedAt: Date.now() })
}

// Salva (ou remove, passando null) a imagem do mapa do mundo do livro.
export async function updateWorldMapImage(projectId: string, imageUrl: string | null) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    worldMapImageUrl: imageUrl ?? deleteField(),
    updatedAt: Date.now(),
  })
}

// Salva (ou remove, passando null) a capa do livro.
export async function updateCover(projectId: string, cover: BookCover | null) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    cover: cover ?? deleteField(),
    updatedAt: Date.now(),
  })
}

// Salva (ou remove, passando null) o modelo do sumário do livro. A
// lista de capítulos em si nunca é salva aqui — é sempre recalculada
// da estrutura atual de capítulos na hora de exibir/imprimir.
// O Firestore recusa campos `undefined` (a gravação inteira falha) —
// e o sumário tem vários opcionais (texto antes/depois, estilos por
// parte), então eles são tirados antes de salvar.
export async function updateSummary(projectId: string, summary: BookSummary | null) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    summary: summary ? JSON.parse(JSON.stringify(summary)) : deleteField(),
    updatedAt: Date.now(),
  })
}

// Salva as seções do livro (Sumário, Capítulos, Dedicatória...) na
// ordem em que aparecem na lista lateral e no livro.
export async function updateSections(projectId: string, sections: BookSection[]) {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    sections: JSON.parse(JSON.stringify(sections)),
    updatedAt: Date.now(),
  })
}
