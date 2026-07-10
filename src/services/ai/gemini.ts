import type { AiProvider, BookQuestionInput, CharacterAnalysisInput, TimelineAnalysisInput } from './types'
import type { CharacterChapterSummaryAnalysis, CharacterConnectionsAnalysis, CharacterDetailsAnalysis, ChapterOrderAnalysis, StoryTimelineAnalysis } from '@/types'

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

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      'A chave VITE_GEMINI_API_KEY não está configurada. Adicione-a ao arquivo .env e reinicie o servidor.',
    )
  }

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
        responseMimeType: 'application/json',
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

function cleanJsonResponse(value: string) {
  return value
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/, '')
    .replace(/\s*```$/, '')
}

function parseCharacterDetails(
  value: string,
  input: CharacterAnalysisInput,
): Omit<CharacterDetailsAnalysis, 'analyzedAt'> {
  let parsed: Partial<CharacterDetailsAnalysis>

  try {
    parsed = JSON.parse(cleanJsonResponse(value)) as Partial<CharacterDetailsAnalysis>
  } catch {
    throw new Error('O Gemini respondeu, mas o conteúdo não veio em um JSON válido. Tente gerar a análise novamente.')
  }

  const fallback = 'Não há informações suficientes nos capítulos analisados.'

  return {
    physicalCharacteristics: parsed.physicalCharacteristics?.trim() || fallback,
    personality: parsed.personality?.trim() || fallback,
    age: parsed.age?.trim() || fallback,
    mainPlot: parsed.mainPlot?.trim() || fallback,
    motivation: parsed.motivation?.trim() || fallback,
    analyzedChapterIds: input.chapters.map((chapter) => chapter.id),
    analysisScope: input.scope,
  }
}


function parseConnections(value: string, input: CharacterAnalysisInput): Omit<CharacterConnectionsAnalysis, 'analyzedAt'> {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<CharacterConnectionsAnalysis>
    return {
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
      analyzedChapterIds: input.chapters.map(chapter => chapter.id),
      analysisScope: input.scope,
    }
  } catch { throw new Error('O Gemini respondeu, mas as conexões não vieram em JSON válido. Tente novamente.') }
}

function parseChapterSummary(value: string, input: CharacterAnalysisInput): Omit<CharacterChapterSummaryAnalysis, 'analyzedAt'> {
  try {
    const parsed = JSON.parse(cleanJsonResponse(value)) as Partial<CharacterChapterSummaryAnalysis>
    return {
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters.filter(item => item.appeared !== false) : [],
      analyzedChapterIds: input.chapters.map(chapter => chapter.id),
      analysisScope: input.scope,
    }
  } catch { throw new Error('O Gemini respondeu, mas os resumos não vieram em JSON válido. Tente novamente.') }
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
"""${text}"""`)
  },

  async suggestIdea(context: string) {
    return callGemini(`Você é um assistente de escrita criativa. Com base no contexto abaixo,
sugira 3 ideias curtas para continuar a cena ou o capítulo.

Contexto:
"""${context}"""`)
  },

  async answerBookQuestion(input: BookQuestionInput) {
    const chapterContext = input.chapters
      .map((chapter) => `CAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')
      .slice(0, 120000)

    const characterContext = input.characters
      .map((character) => `${character.name}${character.aliases.length ? ` (${character.aliases.join(', ')})` : ''}: ${character.details || 'sem análise cadastrada'}`)
      .join('\n')

    return callGemini(`Você é o copiloto editorial do livro "${input.bookTitle}".
Responda à pergunta usando somente os dados fornecidos. Não invente fatos.
Quando não houver evidência suficiente, diga isso claramente.
Seja direto, útil e escreva em português do Brasil.

PERGUNTA:
${input.question}

CAPÍTULO ATUAL:
${input.activeChapter ? `${input.activeChapter.title}\n${input.activeChapter.content}` : 'nenhum selecionado'}

PERSONAGENS CADASTRADOS:
${characterContext || 'nenhum'}

MANUSCRITO:
${chapterContext}`)
  },

  async analyzeCharacterDetails(input) {
    const chapterText = input.chapters
      .map((chapter) => `CAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')

    const prompt = `Você é um analista literário. Analise somente o que está explícito ou pode ser inferido com segurança no texto.
O personagem principal analisado é: "${input.characterName}".
Nomes alternativos, apelidos, títulos ou identidades/fases conhecidas: ${input.characterAliases.length ? input.characterAliases.map((name) => `"${name}"`).join(', ') : 'nenhum informado'}.

Retorne APENAS um objeto JSON válido, sem markdown, com exatamente estas chaves:
{
  "physicalCharacteristics": "características físicas descritas no texto",
  "personality": "traços de personalidade demonstrados por ações, falas e pensamentos",
  "age": "idade exata, aproximada ou fase da vida; explique brevemente a evidência",
  "mainPlot": "papel do personagem e seu enredo principal no recorte analisado",
  "motivation": "objetivos, desejos, medos ou forças que orientam suas ações"
}

Regras:
- Escreva em português do Brasil.
- Não invente informações.
- Quando não houver evidência, escreva: "Não há informações suficientes nos capítulos analisados."
- Seja objetivo, mas produza respostas completas de 1 a 3 parágrafos curtos por campo.
- Trate o nome principal e todos os nomes alternativos informados como possíveis referências à mesma pessoa.
- Associe identidades somente quando o texto ou os nomes fornecidos sustentarem essa associação.
- Considere pronomes, títulos, apelidos, mudanças de idade e fases da vida, mas não misture personagens diferentes por suposição.

TEXTO DO LIVRO:
${chapterText}`

    const response = await callGemini(prompt)
    return parseCharacterDetails(response, input)
  },

  async analyzeCharacterConnections(input) {
    const chapterText = input.chapters.map(chapter => `ID: ${chapter.id}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`).join('\n\n---\n\n')
    const response = await callGemini(`Você é um analista literário. Analise as conexões do personagem "${input.characterName}".
Aliases/fases da mesma pessoa: ${input.characterAliases.join(', ') || 'nenhum'}.
Retorne APENAS JSON válido:
{"connections":[{"characterName":"","relationshipType":"family|friend|enemy|acquaintance","relationshipLabel":"","firstMeetingChapterId":"","firstMeetingChapterTitle":"","firstMeetingContext":"","currentContext":""}],"timeline":[{"chapterId":"","chapterTitle":"","connectedCharacters":[""],"summary":""}]}
Regras: português do Brasil; não invente; associe aliases ao personagem principal; árvore genealógica entra como relationshipType family; diferencie amigos, inimigos e conhecidos; registre quando se conheceram somente se houver evidência; timeline em ordem dos capítulos e apenas eventos de conexão relevantes.
TEXTO:\n${chapterText}`)
    return parseConnections(response, input)
  },

  async analyzeCharacterChapterSummary(input) {
    const chapterText = input.chapters.map(chapter => `ID: ${chapter.id}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`).join('\n\n---\n\n')
    const response = await callGemini(`Você é um analista literário. Resuma a participação de "${input.characterName}" em cada capítulo em que realmente aparece.
Aliases/fases da mesma pessoa: ${input.characterAliases.join(', ') || 'nenhum'}.
Retorne APENAS JSON válido:
{"chapters":[{"chapterId":"","chapterTitle":"","appeared":true,"summary":"","keyActions":[""],"characterState":""}]}
Regras: português do Brasil; não invente; associe aliases e fases; omita capítulos sem aparição real; resumo objetivo porém completo; keyActions são ações relevantes; characterState descreve estado emocional, físico ou narrativo apenas quando sustentado pelo texto.
TEXTO:\n${chapterText}`)
    return parseChapterSummary(response, input)
  },

  async analyzeChapterOrder(input) {
    const chapterText = input.chapters
      .map((chapter) => `ID: ${chapter.id}\nORDEM ATUAL: ${chapter.order}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')

    const response = await callGemini(`Você é um editor literário. Avalie a sequência atual dos capítulos e sugira a melhor ordem narrativa.
Retorne APENAS JSON válido:
{"summary":"","suggestions":[{"chapterId":"","chapterTitle":"","currentOrder":1,"suggestedOrder":1,"reason":""}]}
Regras:
- Inclua todos os capítulos exatamente uma vez.
- suggestedOrder deve formar uma sequência contínua começando em 1.
- Considere cronologia, apresentação de personagens, ritmo, tensão, revelações e continuidade.
- Não altere a ordem só por alterar; mantenha quando ela já funcionar.
- Escreva em português do Brasil.
CAPÍTULOS:
${chapterText}`)

    return parseChapterOrder(response, input)
  },

  async analyzeStoryTimeline(input) {
    const chapterText = input.chapters
      .map((chapter) => `ID: ${chapter.id}\nCAPÍTULO: ${chapter.title}\n${chapter.content}`)
      .join('\n\n---\n\n')

    const response = await callGemini(`Você é um analista de continuidade narrativa. Monte a sequência cronológica dos principais eventos do livro.
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
- Escreva em português do Brasil.
CAPÍTULOS:
${chapterText}`)

    return parseStoryTimeline(response)
  },
}
