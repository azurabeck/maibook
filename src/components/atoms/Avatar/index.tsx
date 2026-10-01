import { useState } from 'react'
import type { AvatarProps } from './type'
import { avatarCss } from './css'

// Círculo do usuário: mostra a imagem do avatar ou, se não houver
// (ou o link estiver quebrado), a inicial do nome.
export function Avatar({ name, imageUrl, size = 28 }: AvatarProps) {
  // guarda QUAL link falhou, pra tentar de novo se o link mudar
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const showImage = Boolean(imageUrl) && imageUrl !== failedUrl
  const initial = name.trim().charAt(0).toUpperCase() || 'A'

  return (
    <span
      className={avatarCss.avatar}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.46) }}
    >
      {showImage ? (
        <img src={imageUrl} alt={name} onError={() => setFailedUrl(imageUrl ?? null)} />
      ) : (
        initial
      )}
    </span>
  )
}
