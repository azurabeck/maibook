// Camada de acesso a dados das IDEIAS (bloco de notas do livro) no
// Firestore. Assim como capítulos e personagens, vivem numa
// subcoleção dentro do próprio projeto -> projects/{projectId}/ideas.
import { addDoc, arrayUnion, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Idea, IdeaDiscussionMessage, IdeaKind, IdeaMoment } from '@/types'

function ideasCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'ideas')
}

function ideaDoc(projectId: string, ideaId: string) {
  return doc(db, 'projects', projectId, 'ideas', ideaId)
}

export function subscribeToIdeas(projectId: string, onChange: (ideas: Idea[]) => void) {
  return onSnapshot(query(ideasCollection(projectId), orderBy('createdAt', 'desc')), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, projectId, ...item.data() }) as Idea))
  })
}

export interface CreateIdeaInput {
  kind: IdeaKind
  content: string
  characterName?: string
  moment?: IdeaMoment
}

export async function createIdea(projectId: string, input: CreateIdeaInput) {
  const now = Date.now()
  const reference = await addDoc(ideasCollection(projectId), {
    kind: input.kind,
    content: input.content.trim(),
    ...(input.kind === 'character' && input.characterName?.trim() ? { characterName: input.characterName.trim() } : {}),
    ...(input.kind === 'story' && input.moment ? { moment: input.moment } : {}),
    createdAt: now,
    updatedAt: now,
  })
  return reference.id
}

export interface UpdateIdeaInput {
  content: string
  characterName?: string
  moment?: IdeaMoment
}

export async function updateIdea(projectId: string, ideaId: string, input: UpdateIdeaInput) {
  const characterName = input.characterName?.trim()
  await updateDoc(ideaDoc(projectId, ideaId), {
    content: input.content.trim(),
    characterName: characterName ? characterName : deleteField(),
    moment: input.moment ?? deleteField(),
    updatedAt: Date.now(),
  })
}

export async function deleteIdea(projectId: string, ideaId: string) {
  await deleteDoc(ideaDoc(projectId, ideaId))
}

// Registra uma pergunta feita à IA e a resposta recebida no histórico
// da própria ideia, pra poder ser consultada depois.
export async function appendIdeaDiscussionMessage(
  projectId: string,
  ideaId: string,
  message: IdeaDiscussionMessage,
) {
  await updateDoc(ideaDoc(projectId, ideaId), {
    discussion: arrayUnion(message),
    updatedAt: Date.now(),
  })
}
