import type { CharacterChapterSummaryAnalysis, CharacterConnectionsAnalysis, CharacterDetailsAnalysis, ChapterOrderAnalysis, LocationConnectionsAnalysis, LocationDetailsAnalysis, LocationEventsAnalysis, StoryTimelineAnalysis } from '@/types'

// Detalhes + Conexões + Eventos de um lugar, gerados numa ÚNICA
// chamada de IA (em vez de 3 chamadas separadas) — o manuscrito só é
// reenviado uma vez, o que reduz bastante o custo em tokens.
export interface LocationFullAnalysisResult {
  details: Omit<LocationDetailsAnalysis, 'analyzedAt'>
  connections: Omit<LocationConnectionsAnalysis, 'analyzedAt'>
  events: Omit<LocationEventsAnalysis, 'analyzedAt'>
}

// Detalhes + Conexões + Resumo por capítulo de um personagem, gerados
// numa ÚNICA chamada de IA (em vez de 3 chamadas separadas) — o
// manuscrito só é reenviado uma vez, o que reduz bastante o custo em tokens.
export interface CharacterFullAnalysisResult {
  details: Omit<CharacterDetailsAnalysis, 'analyzedAt'>
  connections: Omit<CharacterConnectionsAnalysis, 'analyzedAt'>
  chapterSummary: Omit<CharacterChapterSummaryAnalysis, 'analyzedAt'>
}

export interface CharacterAnalysisInput {
  characterName: string
  characterAliases: string[]
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  scope: 'all' | 'chapter'
}

export interface TimelineAnalysisInput {
  chapters: Array<{ id: string; title: string; order: number; content: string }>
}

export interface LocationAnalysisInput {
  locationName: string
  locationAliases: string[]
  chapters: Array<{
    id: string
    title: string
    content: string
  }>
  scope: 'all' | 'chapter'
}

export interface CharacterDetectionInput {
  chapters: Array<{ id: string; title: string; content: string }>
  existingNames: string[]
}

export interface CharacterDetectionResult {
  characters: string[]
}

export interface LocationDetectionInput {
  chapters: Array<{ id: string; title: string; content: string }>
  existingNames: string[]
}

export interface LocationDetectionResult {
  locations: string[]
}

export interface BookQuestionInput {
  question: string
  bookTitle: string
  activeChapter?: { title: string; content: string }
  chapters: Array<{ title: string; content: string }>
  characters: Array<{ name: string; aliases: string[]; details?: string }>
  // trocas anteriores da MESMA conversa, pra a IA manter contexto
  // entre perguntas em vez de responder cada uma isolada
  history?: Array<{ question: string; answer: string }>
}

export interface IdeaDiscussionInput {
  question: string
  bookTitle: string
  idea: {
    kind: 'story' | 'character'
    content: string
    characterName?: string
    momentLabel?: string
  }
  chapters: Array<{ title: string; content: string }>
  characters: Array<{ name: string; aliases: string[] }>
}

export interface AiProvider {
  name: string
  reviewGrammar(text: string): Promise<string>
  reviewChapterQuality(text: string): Promise<string>
  suggestDialogueImprovements(text: string): Promise<string>
  suggestIdea(context: string): Promise<string>
  answerBookQuestion(input: BookQuestionInput): Promise<string>
  discussIdea(input: IdeaDiscussionInput): Promise<string>
  analyzeCharacterFull(input: CharacterAnalysisInput): Promise<CharacterFullAnalysisResult>
  detectBookCharacters(input: CharacterDetectionInput): Promise<CharacterDetectionResult>
  detectBookLocations(input: LocationDetectionInput): Promise<LocationDetectionResult>
  analyzeLocationFull(input: LocationAnalysisInput): Promise<LocationFullAnalysisResult>
  analyzeChapterOrder(input: TimelineAnalysisInput): Promise<Omit<ChapterOrderAnalysis, 'analyzedAt'>>
  analyzeStoryTimeline(input: TimelineAnalysisInput): Promise<Omit<StoryTimelineAnalysis, 'analyzedAt'>>
}
