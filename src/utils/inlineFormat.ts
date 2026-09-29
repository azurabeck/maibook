// Formatação dentro do texto dos capítulos (negrito e itálico).
//
// Decisão de formato: o conteúdo do capítulo continua sendo TEXTO
// SIMPLES no Firestore (uma linha = um parágrafo), com marcações no
// estilo Markdown:
//   **negrito**   *itálico*   ***os dois***
// Um "*" ou "\" literal é gravado escapado ("\*", "\\").
//
// Por quê não salvar HTML? Porque todo o resto do app (IA, busca,
// contagem de palavras, pré-visualização, exportação .docx) já lê o
// capítulo como texto puro — com as marcações, os capítulos antigos
// continuam válidos sem migração e a IA entende a formatação.
//
// Regras de leitura (parseInline):
//   - cada "**" liga/desliga o negrito e cada "*" liga/desliga o
//     itálico (o serializador nunca gera dois marcadores do mesmo
//     tipo no mesmo ponto, por isso "***" = "**" + "*" é seguro);
//   - um marcador só abre se o próximo caractere não for espaço e só
//     fecha se o anterior não for espaço, e o trecho entre os dois
//     precisa ter texto. Isso mantém literais coisas como "* * *" ou
//     "***" (quebra de cena) e "2 * 3 * 4";
//   - marcador sem par vira texto literal.

export interface TextRun {
  text: string
  bold: boolean
  italic: boolean
}

type Token =
  | { kind: 'text'; text: string }
  | { kind: 'bold' | 'italic'; raw: string; spaceBefore: boolean; spaceAfter: boolean; paired: boolean }

type MarkerToken = Extract<Token, { kind: 'bold' | 'italic' }>

const isSpace = (char: string | undefined) => char === undefined || /\s/.test(char)

function tokenize(line: string): Token[] {
  const tokens: Token[] = []
  let text = ''
  const flushText = () => {
    if (text) tokens.push({ kind: 'text', text })
    text = ''
  }

  let index = 0
  while (index < line.length) {
    const char = line[index]
    if (char === '\\' && (line[index + 1] === '*' || line[index + 1] === '\\')) {
      text += line[index + 1]
      index += 2
      continue
    }
    if (char === '*') {
      const raw = line[index + 1] === '*' ? '**' : '*'
      flushText()
      tokens.push({
        kind: raw === '**' ? 'bold' : 'italic',
        raw,
        spaceBefore: isSpace(line[index - 1]),
        spaceAfter: isSpace(line[index + raw.length]),
        paired: false,
      })
      index += raw.length
      continue
    }
    text += char
    index += 1
  }
  flushText()
  return tokens
}

// Casa abridor/fechador de cada tipo, na ordem em que aparecem.
function pairMarkers(tokens: Token[], kind: MarkerToken['kind']) {
  const positions = tokens.flatMap((token, index) => (token.kind === kind ? [index] : []))
  let i = 0
  while (i < positions.length - 1) {
    const opener = tokens[positions[i]] as MarkerToken
    const closer = tokens[positions[i + 1]] as MarkerToken
    const inner = tokens
      .slice(positions[i] + 1, positions[i + 1])
      .map((token) => (token.kind === 'text' ? token.text : ''))
      .join('')
    if (!opener.spaceAfter && !closer.spaceBefore && inner.trim()) {
      opener.paired = true
      closer.paired = true
      i += 2
    } else {
      i += 1
    }
  }
}

function pushRun(runs: TextRun[], run: TextRun) {
  if (!run.text) return
  const last = runs[runs.length - 1]
  if (last && last.bold === run.bold && last.italic === run.italic) last.text += run.text
  else runs.push({ ...run })
}

// Uma linha (parágrafo) com marcações -> trechos com estilo
export function parseInline(line: string): TextRun[] {
  const tokens = tokenize(line)
  pairMarkers(tokens, 'bold')
  pairMarkers(tokens, 'italic')

  const runs: TextRun[] = []
  let bold = false
  let italic = false
  for (const token of tokens) {
    if (token.kind === 'text') {
      pushRun(runs, { text: token.text, bold, italic })
    } else if (!token.paired) {
      pushRun(runs, { text: token.raw, bold, italic })
    } else if (token.kind === 'bold') {
      bold = !bold
    } else {
      italic = !italic
    }
  }
  return runs
}

// Trechos com estilo -> uma linha com marcações (inverso do parseInline)
export function serializeInline(runs: TextRun[]): string {
  // espaço no começo/fim de um trecho formatado vai pra fora das
  // marcações ("** a**" não seria lido de volta como negrito)
  const normalized: TextRun[] = []
  for (const run of runs) {
    if (!run.bold && !run.italic) {
      pushRun(normalized, run)
      continue
    }
    const [, leading, core, trailing] = /^(\s*)([\s\S]*?)(\s*)$/.exec(run.text) ?? ['', '', run.text, '']
    pushRun(normalized, { text: leading, bold: false, italic: false })
    pushRun(normalized, { text: core, bold: run.bold, italic: run.italic })
    pushRun(normalized, { text: trailing, bold: false, italic: false })
  }

  const write = (escape: boolean) => {
    let output = ''
    let bold = false
    let italic = false
    for (const run of normalized) {
      if (run.bold !== bold) output += '**'
      if (run.italic !== italic) output += '*'
      bold = run.bold
      italic = run.italic
      output += escape ? run.text.replace(/[\\*]/g, (char) => `\\${char}`) : run.text
    }
    if (bold) output += '**'
    if (italic) output += '*'
    return output
  }

  // só escapa "*" e "\" quando precisa: se o texto sem escape já é
  // lido de volta igualzinho, fica sem (ex: "* * *" continua "* * *")
  const plain = write(false)
  const sameRuns = (a: TextRun[], b: TextRun[]) =>
    a.length === b.length && a.every((run, i) => run.text === b[i].text && run.bold === b[i].bold && run.italic === b[i].italic)
  return sameRuns(parseInline(plain), normalized) ? plain : write(true)
}

// Texto sem marcações — pra contagem de palavras, IA, etc.
export function stripInline(text: string): string {
  return text
    .split('\n')
    .map((line) => parseInline(line).map((run) => run.text).join(''))
    .join('\n')
}

// #region Palavras com estilo (paginação da pré-visualização do livro)
// A pré-visualização quebra os parágrafos palavra por palavra pra
// caber nas páginas; cada palavra guarda os próprios trechos, então
// um negrito que atravessa a quebra de página continua certo nas duas.
export type StyledWord = TextRun[]

export function splitStyledWords(line: string): StyledWord[] {
  const words: StyledWord[] = []
  let current: StyledWord = []
  for (const run of parseInline(line)) {
    for (const piece of run.text.split(/(\s+)/)) {
      if (!piece) continue
      if (/^\s+$/.test(piece)) {
        if (current.length) words.push(current)
        current = []
      } else {
        current.push({ ...run, text: piece })
      }
    }
  }
  if (current.length) words.push(current)
  return words
}

export function joinStyledWords(words: StyledWord[]): TextRun[] {
  const runs: TextRun[] = []
  words.forEach((word, index) => {
    if (index > 0) {
      // o espaço herda o estilo que as duas palavras vizinhas têm em
      // comum, pra "**duas palavras**" continuar sendo um trecho só
      const before = words[index - 1][words[index - 1].length - 1]
      const after = word[0]
      pushRun(runs, { text: ' ', bold: before.bold && after.bold, italic: before.italic && after.italic })
    }
    word.forEach((run) => pushRun(runs, run))
  })
  return runs
}
// #endregion
