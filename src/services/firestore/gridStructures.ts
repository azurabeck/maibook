import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { GridStructure, GridStructureDraft } from '@/types'

function gridStructuresCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'gridStructures')
}

function gridStructureDoc(projectId: string, structureId: string) {
  return doc(db, 'projects', projectId, 'gridStructures', structureId)
}

export function subscribeToGridStructures(
  projectId: string,
  onChange: (structures: GridStructure[]) => void,
) {
  const structuresQuery = query(gridStructuresCollection(projectId), orderBy('createdAt', 'desc'))

  return onSnapshot(structuresQuery, (snapshot) => {
    onChange(snapshot.docs.map((item) => ({
      id: item.id,
      projectId,
      ...item.data(),
    }) as GridStructure))
  })
}

export async function createGridStructure(projectId: string, structure: GridStructureDraft) {
  const now = Date.now()
  const reference = await addDoc(gridStructuresCollection(projectId), {
    ...structure,
    createdAt: now,
    updatedAt: now,
  })
  return reference.id
}

export async function updateGridStructure(
  projectId: string,
  structureId: string,
  structure: GridStructureDraft,
) {
  await updateDoc(gridStructureDoc(projectId, structureId), {
    ...structure,
    updatedAt: Date.now(),
  })
}

export async function deleteGridStructure(projectId: string, structureId: string) {
  await deleteDoc(gridStructureDoc(projectId, structureId))
}
