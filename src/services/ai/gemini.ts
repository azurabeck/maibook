// Serviço específico do Gemini. A ideia é que NENHUM componente
// chame o Gemini diretamente — todo mundo chama através da interface
// "AiProvider" (veja ./types.ts). Assim, no futuro, plugar OpenAI
// ou outro provedor é só criar outro arquivo tipo "openai.ts" que
// implementa a mesma interface, sem tocar nos componentes.

import type { AiProvider } from './types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function callGemini(prompt: string): Promise<string> {
  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!response.ok) {
    throw new Error(`Erro na chamada ao Gemini: ${response.status}`)
  }

  const data = await response.json()
  // A resposta do Gemini vem aninhada assim — extraímos só o texto.
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  return text
}

export const geminiProvider: AiProvider = {
  name: 'gemini',

  async reviewGrammar(text: string) {
    const prompt = `Revise a gramática e ortografia do texto abaixo, em português.
Retorne APENAS o texto corrigido, sem explicações.

Texto:
"""${text}"""`
    return callGemini(prompt)
  },

  async suggestIdea(context: string) {
    const prompt = `Você é um assistente de escrita criativa. Com base no contexto abaixo,
sugira 3 ideias curtas para continuar a cena ou o capítulo.

Contexto:
"""${context}"""`
    return callGemini(prompt)
  },
}
