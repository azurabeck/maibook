import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { FooterStructure, FooterStructureDraft } from '@/types'

const footerStructuresCollection = (projectId: string) => collection(db, 'projects', projectId, 'footerStructures')
const footerStructureDoc = (projectId: string, structureId: string) => doc(db, 'projects', projectId, 'footerStructures', structureId)

export function subscribeToFooterStructures(projectId: string, onChange: (structures: FooterStructure[]) => void) {
  return onSnapshot(query(footerStructuresCollection(projectId), orderBy('createdAt', 'desc')), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, projectId, ...item.data() }) as FooterStructure))
  })
}

export async function createFooterStructure(projectId: string, structure: FooterStructureDraft) {
  const now = Date.now()
  return (await addDoc(footerStructuresCollection(projectId), { ...structure, createdAt: now, updatedAt: now })).id
}
export async function updateFooterStructure(projectId: string, structureId: string, structure: FooterStructureDraft) {
  await updateDoc(footerStructureDoc(projectId, structureId), { ...structure, updatedAt: Date.now() })
}
export async function deleteFooterStructure(projectId: string, structureId: string) {
  await deleteDoc(footerStructureDoc(projectId, structureId))
}
