import { geminiProvider } from './gemini'
import type { AiProvider } from './types'

// Por enquanto, sempre usamos o Gemini. No futuro, dá pra evoluir
// isso pra ler uma preferência do usuário (salva no Firestore, por
// exemplo) e escolher entre { gemini, openai, claude } aqui.
export const aiProvider: AiProvider = geminiProvider
