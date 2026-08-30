import type { AiProvider, BookQuestionInput, CharacterAnalysisInput, CharacterDetectionInput, CharacterDetectionResult, CharacterFullAnalysisResult, IdeaDiscussionInput, LocationAnalysisInput, LocationDetectionInput, LocationDetectionResult, LocationFullAnalysisResult, TimelineAnalysisInput } from './types'
import type { CharacterConnection, CharacterConnectionTimelineEvent, ChapterOrderAnalysis, CharacterChapterSummaryItem, LocationConnection, LocationEventItem, StoryTimelineAnalysis } from '@/types'

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL?.trim() || 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

interface GeminiErrorResponse {
  error?: {
    code?: number
    message?: string
    status?: string
  }
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>
    }
    finishReason?: string
  }>
  promptFeedback?: {
    blockReason?: string
  }
}

async function readGeminiError(response: Response) {
  const errorData = await response.json().catch(() => null) as GeminiErrorResponse | null
  const apiMessage = errorData?.error?.message?.trim()

  if (apiMessage) {
    return `Gemini (${response.status}): ${apiMessage}`
  }

  return `Erro na chamada ao Gemini: ${response.status} ${response.statusText}`.trim()
}

async function callGemini(prompt: string, options?: { json?: boolean }): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'A chave VITE_GEMINI_API_KEY não está configurada. Adicione-a ao arquivo .env e reinicie o servidor.',
    )
  }

  const wantsJson = options?.json ?? true

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        ...(wantsJson ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(await readGeminiError(response))
  }

  const data = await response.json() as GeminiGenerateResponse
  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim()

  if (!text) {
    const blockReason = data.promptFeedback?.blockReason
    const finishReason = data.candidates?.[0]?.finishReason
    const reason = blockReason || finishReason

    throw new Error(
      reason
        ? `O Gemini não retornou conteúdo. Motivo: ${reason}.`
        : 'O Gemini não retornou conteúdo para esta análise.',
    )
  }

  return text
}

// Formato ÚNICO de manuscrito, usado por toda análise que manda o
// livro inteiro pro Gemini. Importante: ele fica sempre no INÍCIO do
// prompt (antes de qualquer instrução específica da chamada). Assim,
// duas chamadas seguidas sobre o mesmo livro (ex: analisar o
// personagem A e depois o personagem B, ou detectar personagens e
// depois lugares) compartilham o mesmo prefixo de texto — e o cache
// automático do Gemini 2.5 (implicit caching) consegue reaproveitar
// esses tokens com 90% de desconto, sem precisarmos gerenciar cache
// nenhum na mão.
function buildManuscriptText(chapters: Array<{ id: string; title: string; content: string }>) {
  return chapters
    .map((chapter) => `ID: ${chapter.id}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`)
    .join('\n\n---\n\n')
}

function cleanJsonResponse(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
}

function parseCharacterFullAnalysis(
  value: string,
  input: CharacterAnalysisInput,
): CharacterFullAnalysisResult {
  let parsed: {
    details?: { physicalCharacteristics?: string; personality?: string; age?: string; mainPlot?: string; motivation?: string }
    connections?: CharacterConnection[]
    timeline?: CharacterConnectionTimelineEvent[]
    chapters?: CharacterChapterSummaryItem[]
  }

  try {
    parsed = JSON.parse(cleanJsonResponse(value))
  } catch {
    throw new Error('O Gemini respondeu, mas o conteúdo não veio em um JSON válido. Tente gerar a análise novamente.')
  }

  const fallback = 'Não há informações suficientes nos capítulos analisados.'
  const analyzedChapterIds = input.chapters.map((chapter) => chapter.id)

  return {
    details: {
      physicalCharacteristics: parsed.details?.physicalCharacteristics?.trim() || fallback,
      personality: parsed.details?.personality?.trim() || fallback,
      age: parsed.details?.age?.trim() || fallback,
      mainPlot: parsed.details?.mainPlot?.trim() || fallback,
      motivation: parsed.details?.motivation?.trim() || fallback,
      analyzedChapterIds,
      analysisScope: input.scope,
    },
    connections: {
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      analyzedChapterIds,
      analysisScope: input.scope,
    },
    chapterSummary: {
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters.filter((item) => item.appeared !== false) : [],
      analyzedChapterIds,
      analysisScope: input.scope,
    },
  }
}


function parseLocationFullAnalysis(
  value: string,
  input: LocationAnalysisInput,
): LocationFullAnalysisResult {
  let parsed: {
    details?: { physicalDescription?: string; atmosphere?: string; significance?: string; history?: string }
    connections?: LocationConnection[]
    events?: LocationEventItem[]
  }

  try {
    parsed = JSON.parse(cleanJsonResponse(value))
  } catch {
    throw new Error('O Gemini respondeu, mas o conteúdo não veio em um JSON válido. Tente gerar a análise novamente.')
  }

  const fallback = 'Não há informações suficientes nos capítulos analisados.'
  const analyzedChapterIds = input.chapters.map((chapter) => chapter.id)

  return {
    details: {
      physicalDescription: parsed.details?.physicalDescription?.trim() || fallback,
      atmosphere: parsed.details?.atmosphere?.trim() || fallback,
      significance: parsed.details?.significance?.trim() || fallback,
      history: parsed.details?.history?.trim() || fallback,
      analyzedChapterIds,
      analysisScope: input.scope,
    },
    connections: {
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      analyzedChapterIds,
      analysisScope: input.scope,
    },
    events: {
      events: Array.isArray(parsed.events) ? parsed.events : [],
      analyzedChapterIds,
      analysisScope: input.scope,
    },
  }
}

function parseCharacterDetection(value: string): CharacterDetectionResult {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<CharacterDetectionResult>
    const names = Array.isArray(parsed.characters)
      ? parsed.characters.filter((name): name is string => typeof name === 'string' && name.trim().length > 0).map((name) => name.trim())
      : []
    return { characters: names }
  } catch {
    throw new Error('O Gemini respondeu, mas a lista de personagens não veio em JSON válido. Tente novamente.')
  }
}

function parseLocationDetection(value: string): LocationDetectionResult {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<LocationDetectionResult>
    const names = Array.isArray(parsed.locations)
      ? parsed.locations.filter((name): name is string => typeof name === 'string' && name.trim().length > 0).map((name) => name.trim())
      : []
    return { locations: names }
  } catch {
    throw new Error('O Gemini respondeu, mas a lista de lugares não veio em JSON válido. Tente novamente.')
  }
}

function parseChapterOrder(value: string, input: TimelineAnalysisInput): Omit<ChapterOrderAnalysis, 'analyzedAt'> {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<ChapterOrderAnalysis>
    return {
      summary: parsed.summary?.trim() || 'A IA não forneceu uma justificativa geral.',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : input.chapters.map((chapter) => ({
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        currentOrder: chapter.order,
        suggestedOrder: chapter.order,
        reason: 'Manter na posição atual.',
      })),
    }
  } catch {
    throw new Error('O Gemini respondeu, mas a sugestão de ordem não veio em JSON válido. Tente novamente.')
  }
}

function parseStoryTimeline(value: string): Omit<StoryTimelineAnalysis, 'analyzedAt'> {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<StoryTimelineAnalysis>
    return {
      overview: parsed.overview?.trim() || 'A IA não forneceu um resumo geral.',
      events: Array.isArray(parsed.events)
        ? parsed.events
            .map((event) => ({ ...event, year: Number(event.year) }))
            .filter((event) => Number.isFinite(event.year))
            .sort((a, b) => a.year - b.year)
        : [],
    }
  } catch {
    throw new Error('O Gemini respondeu, mas a timeline da história não veio em JSON válido. Tente novamente.')
  }
}

export const geminiProvider: AiProvider = {
  name: 'gemini',

  async reviewGrammar(text: string) {
    return callGemini(`Revise a gramática e ortografia do texto abaixo, em português.
Retorne APENAS o texto corrigido, sem explicações.

Texto:
"""${text}"""`, { json: false })
  },

  async reviewChapterQuality(text: string) {
    return callGemini(`Você é um revisor editorial experiente. Revise o texto abaixo, em português do Brasil, corrigindo:
- Gramática e ortografia
- Pontuação
- Coerência textual
- Conjugação verbal e concordância
- Ritmo e fluidez da narrativa

Regras:
- Preserve a voz, o estilo e as escolhas criativas do autor.
- Faça apenas os ajustes necessários; não reescreva frases que já estão corretas.
- Não adicione nem remova conteúdo da história, apenas corrija e refine a escrita.
- Mantenha exatamente as mesmas quebras de linha e parágrafos do texto original.
- Retorne APENAS o texto revisado completo, sem comentários, marcações, aspas envolventes ou explicações.

Texto:
"""${text}"""`, { json: false })
  },

  async suggestDialogueImprovements(text: string) {
    return callGemini(`Você é um roteirista e editor de diálogos de ficção. No texto abaixo, reescreva de forma mais elaborada e trabalhada APENAS as falas dos personagens (linhas de diálogo, normalmente iniciadas por travessão —).

O objetivo NÃO é fazer pequenas correções gramaticais — é reconstruir a fala para que ela funcione melhor na cena:
- Alongue falas quando isso ajudar a aprofundar emoção, subtexto, tensão ou a personalidade do personagem.
- Encurte ou corte falas quando isso ajudar o ritmo, criar impacto seco ou urgência.
- Use o julgamento de um editor de verdade: cada fala deve soar como algo que aquele personagem diria naquele momento específico, considerando o que está em jogo na cena.
- Respeite rigorosamente o tema do livro, a personalidade já estabelecida de cada personagem e os acontecimentos/contexto da cena — nunca contradiga o que já foi narrado.
- O sentido geral e a intenção de cada fala podem ser expressos com outras palavras, desde que a informação essencial que ela comunica para a trama não se perca.

Regras:
- Não altere nenhuma palavra da narração, descrição ou qualquer trecho fora das falas — copie essas partes exatamente como estão, sem nenhuma modificação.
- Não adicione, remova nem reordene falas ou parágrafos inteiros; trabalhe apenas o texto de cada fala já existente (ela pode ficar mais longa, mais curta, mas continua sendo a fala daquele personagem naquele momento).
- Mantenha exatamente as mesmas quebras de linha e parágrafos do texto original.
- Retorne APENAS o texto completo revisado, sem comentários, marcações, aspas envolventes ou explicações.

Texto:
"""${text}"""`, { json: false })
  },

  async suggestIdea(context: string) {
    return callGemini(`Você é um assistente de escrita criativa. Com base no contexto abaixo,
sugira 3 ideias curtas para continuar a cena ou o capítulo.

Contexto:
"""${context}"""`, { json: false })
  },

  async answerBookQuestion(input: BookQuestionInput) {
    const chapterContext = input.chapters
      .map((chapter) => `CAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')
      .slice(0, 120000)

    const characterContext = input.characters
      .map((character) => `${character.name}${character.aliases.length ? ` (${character.aliases.join(', ')})` : ''}: ${character.details || 'sem análise cadastrada'}`)
      .join('\n')

    const historyText = input.history?.length
      ? input.history.map((turn) => `Autor: ${turn.question}\nVocê: ${turn.answer}`).join('\n\n')
      : ''

    // manuscrito + personagens primeiro (é o que se repete pergunta
    // após pergunta na mesma conversa com o copiloto — fica como
    // prefixo fixo pro cache automático do Gemini poder reaproveitar);
    // histórico da conversa e a pergunta atual, que crescem/mudam a
    // cada chamada, vão por último.
    return callGemini(`MANUSCRITO:
${chapterContext}

PERSONAGENS CADASTRADOS:
${characterContext || 'nenhum'}

---

Você é o copiloto editorial do livro "${input.bookTitle}", conversando com o autor.
Responda à pergunta usando somente os dados fornecidos acima e o histórico da conversa. Não invente fatos.
Quando não houver evidência suficiente, diga isso claramente.
Leve em conta o que já foi perguntado e respondido antes — não repita explicações desnecessárias e mantenha a continuidade da conversa.
Seja direto, útil e escreva em português do Brasil.

CAPÍTULO ATUAL:
${input.activeChapter ? `${input.activeChapter.title}\n${input.activeChapter.content}` : 'nenhum selecionado'}
${historyText ? `\nCONVERSA ATÉ AGORA:\n${historyText}\n` : ''}
PERGUNTA:
${input.question}`, { json: false })
  },

  async discussIdea(input: IdeaDiscussionInput) {
    const chapterContext = input.chapters
      .map((chapter) => `CAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')
      .slice(0, 120000)

    const characterContext = input.characters
      .map((character) => `${character.name}${character.aliases.length ? ` (${character.aliases.join(', ')})` : ''}`)
      .join(', ')

    const ideaContext = [
      `Tipo: ${input.idea.kind === 'character' ? 'Nota para personagem' : 'Nota da história'}`,
      input.idea.characterName ? `Personagem associado: ${input.idea.characterName}` : '',
      input.idea.momentLabel ? `Momento do livro: ${input.idea.momentLabel}` : '',
      `Conteúdo da ideia: ${input.idea.content}`,
    ].filter(Boolean).join('\n')

    // mesma lógica: manuscrito + personagens como prefixo fixo (se
    // repete a cada pergunta feita sobre a mesma ideia), pergunta por último
    return callGemini(`MANUSCRITO:
${chapterContext || 'nenhum capítulo com conteúdo ainda'}

PERSONAGENS CADASTRADOS:
${characterContext || 'nenhum'}

---

Você é o copiloto criativo do autor do livro "${input.bookTitle}". O autor anotou a ideia abaixo e quer sua opinião sincera sobre ela e sobre como ela pode se conectar com o futuro da história.

Responda à pergunta do autor considerando o manuscrito e os personagens acima. Aponte riscos, oportunidades e sugestões práticas. Não invente fatos que não estejam no manuscrito nem na ideia. Quando faltar contexto, diga isso claramente.
Escreva em português do Brasil, em tom de parceiro de escrita, direto e útil.

IDEIA ANOTADA PELO AUTOR:
${ideaContext}

PERGUNTA DO AUTOR:
${input.question}`, { json: false })
  },

  // Gera detalhes + conexões + resumo por capítulo numa ÚNICA chamada
  // — em vez de 3 chamadas separadas, o manuscrito (a parte cara em
  // tokens) só é enviado uma vez.
  async analyzeCharacterFull(input) {
    const chapterText = buildManuscriptText(input.chapters)

    const aliasesText = input.characterAliases.length
      ? input.characterAliases.map((name) => `"${name}"`).join(', ')
      : 'nenhum informado'

    // manuscrito primeiro: quando o autor analisa vários personagens
    // seguidos (mesmos capítulos, escopo "tudo"), esse bloco fica
    // idêntico entre as chamadas e o Gemini reaproveita via cache
    // automático — só o que vem depois (nome, instruções) muda.
    const prompt = `TEXTO DO LIVRO:
${chapterText}

---

Você é um analista literário. Analise somente o que está explícito ou pode ser inferido com segurança no texto acima.
O personagem principal analisado é: "${input.characterName}".
Nomes alternativos, apelidos, títulos ou identidades/fases conhecidas: ${aliasesText}.

Faça TRÊS análises de uma vez e retorne APENAS um objeto JSON válido, sem markdown, com exatamente esta estrutura:
{
  "details": {
    "physicalCharacteristics": "características físicas descritas no texto",
    "personality": "traços de personalidade demonstrados por ações, falas e pensamentos",
    "age": "idade exata, aproximada ou fase da vida; explique brevemente a evidência",
    "mainPlot": "papel do personagem e seu enredo principal no recorte analisado",
    "motivation": "objetivos, desejos, medos ou forças que orientam suas ações"
  },
  "connections": [{"characterName":"","relationshipType":"family|friend|enemy|acquaintance","relationshipLabel":"","firstMeetingChapterId":"","firstMeetingChapterTitle":"","firstMeetingContext":"","currentContext":""}],
  "timeline": [{"chapterId":"","chapterTitle":"","connectedCharacters":[""],"summary":""}],
  "chapters": [{"chapterId":"","chapterTitle":"","appeared":true,"summary":"","keyActions":[""],"characterState":""}]
}

Regras de "details":
- Não invente informações; quando não houver evidência, escreva: "Não há informações suficientes nos capítulos analisados."
- Seja objetivo, mas produza respostas completas de 1 a 3 parágrafos curtos por campo.
- Considere pronomes, títulos, apelidos, mudanças de idade e fases da vida, mas não misture personagens diferentes por suposição.

Regras de "connections" e "timeline":
- Árvore genealógica entra como relationshipType "family"; diferencie amigos, inimigos e conhecidos.
- Registre quando se conheceram somente se houver evidência; timeline em ordem dos capítulos e apenas eventos de conexão relevantes.

Regras de "chapters" (resumo por capítulo):
- Omita capítulos sem aparição real (não inclua no array); resumo objetivo porém completo.
- keyActions são ações relevantes; characterState descreve estado emocional, físico ou narrativo apenas quando sustentado pelo texto.

Regras gerais:
- Escreva em português do Brasil.
- Trate o nome principal e todos os nomes alternativos informados como possíveis referências à mesma pessoa.
- Associe identidades somente quando o texto ou os nomes fornecidos sustentarem essa associação.`

    const response = await callGemini(prompt)
    return parseCharacterFullAnalysis(response, input)
  },

  // Gera detalhes + conexões + eventos numa ÚNICA chamada — em vez de
  // 3 chamadas separadas, o manuscrito (a parte cara em tokens) só é
  // enviado uma vez.
  async analyzeLocationFull(input: LocationAnalysisInput) {
    const chapterText = buildManuscriptText(input.chapters)

    const aliasesText = input.locationAliases.length
      ? input.locationAliases.map((name) => `"${name}"`).join(', ')
      : 'nenhum informado'

    // manuscrito primeiro, mesmo raciocínio de analyzeCharacterFull:
    // maximiza reaproveitamento de cache entre lugares analisados em
    // sequência (e até com análises de personagem, já que o formato
    // do manuscrito é o mesmo).
    const prompt = `TEXTO DO LIVRO:
${chapterText}

---

Você é um analista literário. Analise somente o que está explícito ou pode ser inferido com segurança no texto acima.
O lugar principal analisado é: "${input.locationName}".
Nomes alternativos ou como esse lugar também é chamado no texto: ${aliasesText}.

Faça TRÊS análises de uma vez e retorne APENAS um objeto JSON válido, sem markdown, com exatamente esta estrutura:
{
  "details": {
    "physicalDescription": "aparência física, geografia e estrutura do lugar descritas no texto",
    "atmosphere": "clima emocional, sensações e tom que o lugar transmite na narrativa",
    "significance": "papel do lugar na trama e sua importância para a história",
    "history": "origem, passado ou contexto histórico do lugar, quando mencionado"
  },
  "connections": [{"name":"","connectionType":"place|character","relationshipLabel":"","context":""}],
  "events": [{"chapterId":"","chapterTitle":"","title":"","summary":""}]
}

Regras de "details":
- Não invente informações; quando não houver evidência, escreva: "Não há informações suficientes nos capítulos analisados."
- Produza respostas completas de 1 a 3 parágrafos curtos por campo.

Regras de "connections":
- Use connectionType "place" para outros lugares relacionados (próximos, de onde se chega até lá, parte dele) e "character" para personagens fortemente associados a esse lugar (moram lá, aparecem com frequência, cenas importantes).
- relationshipLabel é um rótulo curto (ex: "fica ao norte de", "mora lá", "esconderijo de"); context explica a relação com base no texto.

Regras de "events":
- Inclua apenas eventos relevantes que realmente acontecem nesse lugar; title é um título curto; summary resume o que aconteceu e por que importa; ordene pela ordem dos capítulos.

Regras gerais:
- Escreva em português do Brasil.
- Trate o nome principal e todos os nomes alternativos informados como possíveis referências ao mesmo lugar.
- Não invente conexões nem eventos sem evidência no texto.`

    const response = await callGemini(prompt)
    return parseLocationFullAnalysis(response, input)
  },

  async detectBookCharacters(input: CharacterDetectionInput) {
    const chapterText = buildManuscriptText(input.chapters)

    // manuscrito primeiro — mesmo formato usado em analyzeCharacterFull
    // e detectBookLocations, então detectar personagens e depois
    // analisar um deles (ou detectar lugares) reaproveita o cache.
    const response = await callGemini(`TEXTO DO LIVRO:
${chapterText}

---

Você é um analista literário. Leia o texto do livro acima e identifique TODOS os personagens (pessoas ou seres com nome próprio que participam da história, falam, agem ou são mencionados de forma relevante).

Personagens já cadastrados pelo autor — NÃO os inclua na resposta, nem variações/apelidos deles: ${input.existingNames.length ? input.existingNames.map((name) => `"${name}"`).join(', ') : 'nenhum'}.

Retorne APENAS um objeto JSON válido, sem markdown, com esta estrutura:
{"characters": ["Nome do personagem", "..."]}

Regras:
- Use o nome mais completo/formal pelo qual o personagem é chamado no texto.
- Não inclua personagens genéricos sem nome próprio (ex: "o garçom", "uma mulher").
- Não repita o mesmo personagem duas vezes.
- Não inclua nenhum personagem já cadastrado, comparando por nome ou apelido.
- Escreva os nomes em português do Brasil, exatamente como aparecem no texto.`)

    return parseCharacterDetection(response)
  },

  async detectBookLocations(input: LocationDetectionInput) {
    const chapterText = buildManuscriptText(input.chapters)

    const response = await callGemini(`TEXTO DO LIVRO:
${chapterText}

---

Você é um analista literário. Leia o texto do livro acima e identifique TODOS os lugares (cenários, cidades, construções, ambientes ou locais específicos com nome próprio onde a história se passa ou que sejam mencionados de forma relevante).

Lugares já cadastrados pelo autor — NÃO os inclua na resposta, nem variações/apelidos deles: ${input.existingNames.length ? input.existingNames.map((name) => `"${name}"`).join(', ') : 'nenhum'}.

Retorne APENAS um objeto JSON válido, sem markdown, com esta estrutura:
{"locations": ["Nome do lugar", "..."]}

Regras:
- Use o nome mais completo/formal pelo qual o lugar é chamado no texto.
- Não inclua lugares genéricos sem nome próprio (ex: "a sala", "uma rua qualquer").
- Não repita o mesmo lugar duas vezes.
- Não inclua nenhum lugar já cadastrado, comparando por nome ou apelido.
- Escreva os nomes em português do Brasil, exatamente como aparecem no texto.`)

    return parseLocationDetection(response)
  },

  async analyzeChapterOrder(input) {
    // este formato inclui ORDEM ATUAL por capítulo (só faz sentido
    // aqui), então não compartilha cache com as outras análises —
    // ainda assim mantemos o manuscrito na frente por consistência.
    const chapterText = input.chapters
      .map((chapter) => `ID: ${chapter.id}\nORDEM ATUAL: ${chapter.order}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')

    const response = await callGemini(`CAPÍTULOS:
${chapterText}

---

Você é um editor literário. Avalie a sequência atual dos capítulos acima e sugira a melhor ordem narrativa.
Retorne APENAS JSON válido:
{"summary":"","suggestions":[{"chapterId":"","chapterTitle":"","currentOrder":1,"suggestedOrder":1,"reason":""}]}
Regras:
- Inclua todos os capítulos exatamente uma vez.
- suggestedOrder deve formar uma sequência contínua começando em 1.
- Considere cronologia, apresentação de personagens, ritmo, tensão, revelações e continuidade.
- Não altere a ordem só por alterar; mantenha quando ela já funcionar.
- Escreva em português do Brasil.`)

    return parseChapterOrder(response, input)
  },

  async analyzeStoryTimeline(input) {
    const chapterText = buildManuscriptText(input.chapters)

    const response = await callGemini(`TEXTO DO LIVRO:
${chapterText}

---

Você é um analista de continuidade narrativa. Monte a sequência cronológica dos principais eventos do livro acima.
O primeiro evento deve ser marcado como ano 0. Calcule os anos seguintes de forma relativa com base em passagens de tempo, idades, datas e pistas do texto.
Retorne APENAS JSON válido:
{"overview":"","events":[{"year":0,"title":"","summary":"","chapterIds":[""],"chapterTitles":[""]}]}
Regras:
- O primeiro evento é sempre ano 0.
- Eventos simultâneos podem compartilhar o mesmo ano.
- Quando não houver passagem de um ano inteiro, mantenha o mesmo ano.
- Não invente datas absolutas.
- Organize os eventos por cronologia interna da história, não necessariamente pela ordem dos capítulos.
- Inclua apenas eventos relevantes para compreender o enredo.
- Escreva em português do Brasil.`)

    return parseStoryTimeline(response)
  },
}
