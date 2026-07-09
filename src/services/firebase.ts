// Este arquivo é o único lugar do app que "conhece" o Firebase.
// Isso é uma boa prática: se um dia você trocar de backend,
// só precisa mexer aqui, não espalhado pelo app inteiro.

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// As variáveis vêm do arquivo .env (veja .env.example).
// No Vite, variáveis de ambiente expostas ao client PRECISAM
// começar com "VITE_", senão elas não ficam disponíveis no código.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)

// Exportamos instâncias prontas pra usar em qualquer lugar do app:
// import { auth, db, storage } from '@/services/firebase'
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
