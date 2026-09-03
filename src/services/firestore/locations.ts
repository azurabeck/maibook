// Camada de acesso a dados dos LUGARES no Firestore. Mesmo padrão de
// personagens: vivem numa subcoleção dentro do próprio projeto ->
// projects/{projectId}/locations/{locationId}.
import { addDoc, collection, deleteDoc, deleteField, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { BookLocation, LocationConnectionsAnalysis, LocationDetailsAnalysis, LocationEventsAnalysis } from '@/types'

function locationsCollection(projectId: string) {
  return collection(db, 'projects', projectId, 'locations')
}

function locationDoc(projectId: string, locationId: string) {
  return doc(db, 'projects', projectId, 'locations', locationId)
}

export function subscribeToLocations(projectId: string, onChange: (locations: BookLocation[]) => void) {
  return onSnapshot(query(locationsCollection(projectId), orderBy('name')), (snapshot) => {
    onChange(snapshot.docs.map((item) => ({ id: item.id, projectId, ...item.data() }) as BookLocation))
  })
}

export async function createLocation(projectId: string, name: string) {
  const now = Date.now()
  const reference = await addDoc(locationsCollection(projectId), {
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
  })
  return reference.id
}

export async function updateLocationAliases(projectId: string, locationId: string, aliases: string[]) {
  await updateDoc(locationDoc(projectId, locationId), {
    aliases,
    updatedAt: Date.now(),
  })
}

// Grava detalhes + conexões + eventos numa ÚNICA escrita no Firestore
// (em vez de 3 updateDoc separados) — resultado da análise combinada
// da IA (ver aiProvider.analyzeLocationFull).
export async function updateLocationFullAnalysis(
  projectId: string,
  locationId: string,
  analysis: {
    detailsAnalysis: LocationDetailsAnalysis
    connectionsAnalysis: LocationConnectionsAnalysis
    eventsAnalysis: LocationEventsAnalysis
  },
) {
  await updateDoc(locationDoc(projectId, locationId), {
    detailsAnalysis: analysis.detailsAnalysis,
    connectionsAnalysis: analysis.connectionsAnalysis,
    eventsAnalysis: analysis.eventsAnalysis,
    updatedAt: Date.now(),
  })
}

// Salva (ou remove, passando null) a imagem do lugar.
export async function updateLocationImage(projectId: string, locationId: string, imageUrl: string | null) {
  await updateDoc(locationDoc(projectId, locationId), {
    imageUrl: imageUrl ?? deleteField(),
    updatedAt: Date.now(),
  })
}

export async function deleteLocation(projectId: string, locationId: string) {
  await deleteDoc(locationDoc(projectId, locationId))
}
