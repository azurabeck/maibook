/// <reference lib="webworker" />
// Verificador ortográfico em segundo plano (Web Worker): o Hunspell (o
// mesmo corretor do LibreOffice/Firefox, compilado pra WebAssembly —
// pacote hunspell-asm) com o dicionário de português do Brasil VERO
// (pacote dictionary-pt). O dicionário tem ~4,5 MB, por isso é
// carregado uma vez só, aqui, sem travar o editor.
//
// Importa a versão CommonJS do hunspell-asm: a versão ESM publicada
// aponta pra arquivos que não vêm no pacote.
import { loadModule } from 'hunspell-asm/dist/cjs/index.js'
import type { Hunspell } from 'hunspell-asm'

type Request =
  | { type: 'check'; id: number; word: string }
  | { type: 'addWords'; words: string[] }

// os arquivos do dicionário viram assets do build (servidos à parte,
// só baixados quando o verificador é usado pela primeira vez)
const affUrl = new URL('../../node_modules/dictionary-pt/index.aff', import.meta.url)
const dicUrl = new URL('../../node_modules/dictionary-pt/index.dic', import.meta.url)

const extraWords = new Set<string>()

async function loadBytes(url: URL) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Não foi possível baixar o dicionário (${response.status}).`)
  return new Uint8Array(await response.arrayBuffer())
}

const spellPromise: Promise<Hunspell> = Promise.all([loadModule(), loadBytes(affUrl), loadBytes(dicUrl)])
  .then(([factory, aff, dic]) => {
    const spell = factory.create(factory.mountBuffer(aff, 'pt_BR.aff'), factory.mountBuffer(dic, 'pt_BR.dic'))
    extraWords.forEach((word) => spell.addWord(word))
    return spell
  })

self.onmessage = async (event: MessageEvent<Request>) => {
  const message = event.data

  if (message.type === 'addWords') {
    message.words.forEach((word) => extraWords.add(word))
    const spell = await spellPromise
    message.words.forEach((word) => spell.addWord(word))
    return
  }

  try {
    const spell = await spellPromise
    const correct = spell.spell(message.word)
    self.postMessage({ id: message.id, correct, suggestions: correct ? [] : spell.suggest(message.word).slice(0, 3) })
  } catch (error) {
    self.postMessage({ id: message.id, error: error instanceof Error ? error.message : String(error) })
  }
}
