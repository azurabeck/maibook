// A versão CommonJS do hunspell-asm (usada em services/spellchecker.worker.ts)
// tem a mesma API da entrada principal do pacote.
declare module 'hunspell-asm/dist/cjs/index.js' {
  export { loadModule } from 'hunspell-asm'
}
