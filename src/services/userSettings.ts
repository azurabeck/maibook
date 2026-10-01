// Preferências do usuário que ficam só no navegador (localStorage),
// separadas por uid — assim duas contas no mesmo computador não
// enxergam a chave nem os gêneros uma da outra.
//
// A chave do Gemini fica aqui de propósito: ela nunca sai do
// navegador do usuário, a não ser nas chamadas feitas direto pro
// Google (ver services/ai/gemini.ts).

import { auth } from '@/services/firebase'

function storageKey(uid: string, name: string) {
  return `maibook-user-${uid}-${name}`
}

function read(uid: string, name: string): string {
  try {
    return localStorage.getItem(storageKey(uid, name)) ?? ''
  } catch {
    // localStorage indisponível (aba anônima, etc.)
    return ''
  }
}

function write(uid: string, name: string, value: string) {
  try {
    if (value) localStorage.setItem(storageKey(uid, name), value)
    else localStorage.removeItem(storageKey(uid, name))
  } catch {
    // não é crítico, ignora
  }
}

// Chave do Gemini do usuário logado ('' = não configurou, usa a da plataforma)
export function getUserGeminiKey(): string {
  const uid = auth.currentUser?.uid
  return uid ? read(uid, 'gemini-key') : ''
}

export function setUserGeminiKey(value: string) {
  const uid = auth.currentUser?.uid
  if (uid) write(uid, 'gemini-key', value.trim())
}

export function getUserGenres(uid: string): string[] {
  try {
    const parsed = JSON.parse(read(uid, 'genres') || '[]')
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function setUserGenres(uid: string, genres: string[]) {
  write(uid, 'genres', genres.length ? JSON.stringify(genres) : '')
}
