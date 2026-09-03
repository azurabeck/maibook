// Camada de acesso ao Firebase Storage pras imagens do projeto
// (mapa do mundo, imagens de lugares). Mesma ideia dos services de
// firestore: centraliza aqui, o resto do app não importa
// `firebase/storage` diretamente.
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/services/firebase'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

// Valida antes de subir — evita gastar uma chamada de rede com um
// arquivo que o Storage (ver storage.rules) ia rejeitar de qualquer jeito.
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Envie um arquivo de imagem (JPG, PNG, WebP...).'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return 'A imagem deve ter no máximo 10MB.'
  }
  return null
}

function extensionOf(file: File) {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase()
  return file.type.split('/')[1] || 'jpg'
}

// Sobe o arquivo sempre no MESMO caminho (baseado no id, não no nome
// do arquivo) — reenviar substitui a imagem anterior em vez de
// acumular lixo no bucket.
async function uploadImageTo(path: string, file: File) {
  const fileRef = ref(storage, path)
  await uploadBytes(fileRef, file)
  return getDownloadURL(fileRef)
}

export async function uploadWorldMapImage(projectId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/world-map.${extensionOf(file)}`, file)
}

export async function uploadLocationImage(projectId: string, locationId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/locations/${locationId}/image.${extensionOf(file)}`, file)
}
