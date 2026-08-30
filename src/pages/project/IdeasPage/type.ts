import type { IdeaKind, IdeaMoment } from '@/types'

export const IDEA_KIND_TABS: Array<{ value: IdeaKind; label: string }> = [
  { value: 'story', label: 'Notas da história' },
  { value: 'character', label: 'Notas para personagem' },
]

export const IDEA_MOMENT_OPTIONS: Array<{ value: IdeaMoment; label: string }> = [
  { value: 'start', label: 'Início do livro' },
  { value: 'middle', label: 'Meio do livro' },
  { value: 'end', label: 'Final do livro' },
  { value: 'future', label: 'Continuação em livros futuros' },
]

export const IDEA_MOMENT_LABELS: Record<IdeaMoment, string> = {
  start: 'Início do livro',
  middle: 'Meio do livro',
  end: 'Final do livro',
  future: 'Continuação em livros futuros',
}
