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

// Alternativa ao upload: o autor cola o link de uma imagem já hospedada
// em outro lugar. Devolve a URL limpa ou null se não for um link http(s).
export function parseImageLink(value: string): string | null {
  const trimmed = value.trim()
  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:' ? trimmed : null
  } catch {
    return null
  }
}

export const INVALID_IMAGE_LINK_MESSAGE = 'Cole um link válido de imagem (começando com http:// ou https://).'

function extensionOf(file: File) {
  const fromName = file.name.split('.').pop()
  if (fromName && fromName.length <= 5 && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase()
  return file.type.split('/')[1] || 'jpg'
}

// Sobe o arquivo sempre no MESMO caminho (baseado no id, não no nome
// do arquivo) — reenviar substitui a imagem anterior em vez de
// acumular lixo no bucket.
//
// Se o Storage recusar o envio (ex.: bucket bloqueado por faturamento),
// a imagem escolhida no computador é embutida direto no Firestore — ver
// embedImageAsDataUrl abaixo.
async function uploadImageTo(path: string, file: File) {
  try {
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, file)
    return await getDownloadURL(fileRef)
  } catch (storageError) {
    console.warn('Storage indisponível, embutindo a imagem no Firestore:', storageError)
    return embedImageAsDataUrl(file)
  }
}

// Um documento do Firestore aceita no máximo 1MB, e a imagem divide
// esse espaço com o resto do documento (o projeto guarda capa + mapa;
// o capítulo guarda o texto). Por isso o teto fica bem abaixo disso.
const MAX_EMBEDDED_LENGTH = 330_000
const MAX_EMBEDDED_DIMENSION = 1600

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Não foi possível ler essa imagem.'))
    }
    image.src = objectUrl
  })
}

// Reduz a imagem no navegador (dimensão e qualidade JPEG) até caber no
// teto acima e devolve como data URL — que funciona em <img>, em
// background-image e no fetch da exportação pra .docx, igual a um link.
async function embedImageAsDataUrl(file: File): Promise<string> {
  const image = await loadImageElement(file)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível processar a imagem neste navegador.')

  let scale = Math.min(1, MAX_EMBEDDED_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight))
  for (let attempt = 0; attempt < 8; attempt += 1) {
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    // JPEG não tem transparência — fundo branco em vez de preto
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of [0.85, 0.7, 0.55]) {
      const dataUrl = canvas.toDataURL('image/jpeg', quality)
      if (dataUrl.length <= MAX_EMBEDDED_LENGTH) return dataUrl
    }
    scale *= 0.75
  }
  throw new Error('Não foi possível reduzir a imagem o suficiente. Tente uma imagem menor.')
}

export async function uploadWorldMapImage(projectId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/world-map.${extensionOf(file)}`, file)
}

export async function uploadCoverImage(projectId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/cover.${extensionOf(file)}`, file)
}

export async function uploadLocationImage(projectId: string, locationId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/locations/${locationId}/image.${extensionOf(file)}`, file)
}

// Imagem de página cheia ou de fundo de um capítulo (ver ChapterPageType).
export async function uploadChapterPageImage(projectId: string, chapterId: string, file: File) {
  return uploadImageTo(`projects/${projectId}/chapters/${chapterId}/page-image.${extensionOf(file)}`, file)
}
