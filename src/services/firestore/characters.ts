import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Character, CharacterChapterSummaryAnalysis, CharacterConnectionsAnalysis, CharacterDetailsAnalysis } from '@/types'

function charactersCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'characters')
}

function characterDoc(projectId: string, characterId: string) {
  return doc(db, 'projects', projectId, 'characters', characterId)
}

export function subscribeToCharacters(projectId: string, onChange: (characters: Character[]) => void) {
  return onSnapshot(query(charactersCollection(projectId), orderBy('name')), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, projectId, ...item.data() }) as Character))
  })
}

export async function createCharacter(projectId: string, name: string) {
  const now = Date.now()
  const reference = await addDoc(charactersCollection(projectId), {
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  })
  return reference.id
}

export async function updateCharacterAliases(
  projectId: string,
  characterId: string,
  aliases: string[],
) {
  await updateDoc(characterDoc(projectId, characterId), {
    aliases,
    updatedAt: Date.now(),
  })
}

export async function updateCharacterDetails(
  projectId: string,
  characterId: string,
  detailsAnalysis: CharacterDetailsAnalysis,
) {
  await updateDoc(characterDoc(projectId, characterId), {
    detailsAnalysis,
    updatedAt: Date.now(),
  })
}


export async function updateCharacterConnections(projectId: string, characterId: string, connectionsAnalysis: CharacterConnectionsAnalysis) {
  await updateDoc(characterDoc(projectId, characterId), { connectionsAnalysis, updatedAt: Date.now() })
}

export async function updateCharacterChapterSummary(projectId: string, characterId: string, chapterSummaryAnalysis: CharacterChapterSummaryAnalysis) {
  await updateDoc(characterDoc(projectId, characterId), { chapterSummaryAnalysis, updatedAt: Date.now() })
}

export async function deleteCharacter(projectId: string, characterId: string) {
  await deleteDoc(characterDoc(projectId, characterId))
}
