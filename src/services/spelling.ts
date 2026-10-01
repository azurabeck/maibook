// Correção ortográfica do menu do botão direito do editor. O menu
// próprio substitui o do navegador (e com ele as sugestões de
// ortografia do navegador, que o site não consegue ler), então a
// verificação é feita aqui mesmo, sem IA: dicionário de português do
// Brasil (ver spellchecker.worker.ts) + as palavras do glossário do
// livro, que contam como corretas (nomes inventados, lugares...).

let worker: Worker | null = null
let nextId = 0
export interface SpellingResult {
  correct: boolean
  suggestions: string[] // até 3; pode vir vazia mesmo com a palavra errada
}

const pending = new Map<number, { resolve: (result: SpellingResult) => void; reject: (error: Error) => void }>()
const glossaryWords = new Set<string>()

function getWorker() {
  if (worker) return worker
  worker = new Worker(new URL('./spellchecker.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<{ id: number; correct?: boolean; suggestions?: string[]; error?: string }>) => {
    const request = pending.get(event.data.id)
    if (!request) return
    pending.delete(event.data.id)
    if (event.data.error) request.reject(new Error(event.data.error))
    else request.resolve({ correct: event.data.correct ?? true, suggestions: event.data.suggestions ?? [] })
  }
  // o worker nem conseguiu carregar: falha tudo que estava esperando
  // (e o próximo clique tenta de novo com um worker novo)
  worker.onerror = (event) => {
    console.error('Corretor ortográfico falhou:', event.message)
    pending.forEach((request) => request.reject(new Error(event.message || 'Corretor ortográfico indisponível.')))
    pending.clear()
    worker?.terminate()
    worker = null
  }
  if (glossaryWords.size) worker.postMessage({ type: 'addWords', words: [...glossaryWords] })
  return worker
}

// Começa a carregar o dicionário antes do primeiro clique direito
// (chamado quando o editor abre)
export function preloadSpellchecker() {
  getWorker()
}

// mesma palavra, ignorando maiúsculas e acentos
const normalize = (word: string) => word.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

// Termos do glossário viram palavras corretas (cada palavra de um
// termo composto, ex.: "Lâmina de Latipha" → Lâmina, de, Latipha)
export function setGlossaryWords(terms: string[]) {
  const words = terms.flatMap((term) => term.split(/\s+/)).map((word) => word.trim()).filter(Boolean)
  const added = words.filter((word) => !glossaryWords.has(word))
  if (!added.length) return
  added.forEach((word) => glossaryWords.add(word))
  worker?.postMessage({ type: 'addWords', words: added })
}

// Palavra correta? E, se não, as sugestões de correção
export function checkWordSpelling(word: string): Promise<SpellingResult> {
  const key = word.trim()
  const normalized = normalize(key)
  if ([...glossaryWords].some((item) => normalize(item) === normalized)) return Promise.resolve({ correct: true, suggestions: [] })

  const id = ++nextId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ type: 'check', id, word: key })
  })
}
