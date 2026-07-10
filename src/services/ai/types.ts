import type { CharacterChapterSummaryAnalysis, CharacterConnectionsAnalysis, CharacterDetailsAnalysis, ChapterOrderAnalysis, StoryTimelineAnalysis } from '@/types'

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

export interface AiProvider {
  name: string
  reviewGrammar(text: string): Promise<string>
  suggestIdea(context: string): Promise<string>
  analyzeCharacterDetails(input: CharacterAnalysisInput): Promise<Omit<CharacterDetailsAnalysis, 'analyzedAt'>>
  analyzeCharacterConnections(input: CharacterAnalysisInput): Promise<Omit<CharacterConnectionsAnalysis, 'analyzedAt'>>
  analyzeCharacterChapterSummary(input: CharacterAnalysisInput): Promise<Omit<CharacterChapterSummaryAnalysis, 'analyzedAt'>>
  analyzeChapterOrder(input: TimelineAnalysisInput): Promise<Omit<ChapterOrderAnalysis, 'analyzedAt'>>
  analyzeStoryTimeline(input: TimelineAnalysisInput): Promise<Omit<StoryTimelineAnalysis, 'analyzedAt'>>
}
