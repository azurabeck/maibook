// Camada de acesso a dados dos PROJETOS (livros) no Firestore.
// Centralizamos as queries aqui — as páginas/componentes não devem
// importar `firebase/firestore` diretamente, só essas funções.
// Isso deixa o resto do app "ignorante" sobre o formato exato das
// queries, e facilita trocar/ajustar o backend no futuro.

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { BookProject } from '@/types'

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
