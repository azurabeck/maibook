import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/services/firebase'

// Store do usuário logado. Guardamos só uma "foto" simples dos dados
// (nome, e-mail, avatar) em vez do objeto User do Firebase: o SDK
// muda esse objeto por dentro (ex: ao trocar o nome) sem criar um
// novo, então o React não perceberia a mudança.

export interface AuthUser {
  uid: string
  displayName: string
  email: string
  photoURL: string
}

interface AuthState {
  user: AuthUser | null
  // 'loading' até o Firebase Auth confirmar se há (ou não) alguém logado
  status: 'loading' | 'ready'
  // relê os dados do usuário atual — chamar depois de updateProfile,
  // que não dispara o onAuthStateChanged
  refreshUser: () => void
}

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null
  return {
    uid: user.uid,
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: 'loading',
  refreshUser: () => set({ user: toAuthUser(auth.currentUser) }),
}))

onAuthStateChanged(auth, (user) => {
  useAuthStore.setState({ user: toAuthUser(user), status: 'ready' })
})
