import { create } from 'zustand'

// Store bem pequena, só pra preferências de interface que não têm
// nada a ver com o projeto/Firestore (não sincroniza com ninguém,
// fica só no navegador de quem está usando).

const FOCUS_MODE_STORAGE_KEY = 'maibook-focus-mode'

function readStoredFocusMode(): boolean {
  try {
    return localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === '1'
  } catch {
    // localStorage indisponível (aba anônima, etc.) — começa desligado
    return false
  }
}

function persistFocusMode(value: boolean) {
  try {
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, value ? '1' : '0')
  } catch {
    // não é crítico, ignora
  }
}

interface UiState {
  // "Modo de foco": esconde o cabeçalho (TopNav) e os painéis ao
  // redor do editor (lista de capítulos, copiloto, visão geral) pra
  // sobrar mais espaço de leitura pra quem está escrevendo.
  focusMode: boolean
  toggleFocusMode: () => void
}

export const useUiStore = create<UiState>((set, get) => ({
  focusMode: readStoredFocusMode(),
  toggleFocusMode: () => {
    const next = !get().focusMode
    persistFocusMode(next)
    set({ focusMode: next })
  },
}))
