import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { HeaderStructure, HeaderStructureDraft } from '@/types'

function headerStructuresCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'headerStructures')
}

function headerStructureDoc(projectId: string, structureId: string) {
  return doc(db, 'projects', projectId, 'headerStructures', structureId)
}

export function subscribeToHeaderStructures(
  projectId: string,
  onChange: (structures: HeaderStructure[]) => void,
) {
  const structuresQuery = query(headerStructuresCollection(projectId), orderBy('createdAt', 'desc'))

  return onSnapshot(structuresQuery, (snapshot) => {
    const structures = snapshot.docs.map(
      (documentSnapshot) =>
        ({
          id: documentSnapshot.id,
          projectId,
          ...documentSnapshot.data(),
        }) as HeaderStructure,
    )

    onChange(structures)
  })
}

export async function createHeaderStructure(
  projectId: string,
  structure: HeaderStructureDraft,
) {
  const now = Date.now()
  const documentReference = await addDoc(headerStructuresCollection(projectId), {
    ...structure,
    createdAt: now,
    updatedAt: now,
  })

  return documentReference.id
}

export async function updateHeaderStructure(
  projectId: string,
  structureId: string,
  structure: HeaderStructureDraft,
) {
  await updateDoc(headerStructureDoc(projectId, structureId), {
    ...structure,
    updatedAt: Date.now(),
  })
}

export async function deleteHeaderStructure(projectId: string, structureId: string) {
  await deleteDoc(headerStructureDoc(projectId, structureId))
}
