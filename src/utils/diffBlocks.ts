import { diffWordsWithSpace } from 'diff'

export type DiffBlock =
  | { type: 'context'; text: string }
  | { type: 'change'; id: number; original: string; suggested: string; applied: boolean }

export function buildDiffBlocks(original: string, revised: string): DiffBlock[] {
  const parts = diffWordsWithSpace(original, revised)
  const blocks: DiffBlock[] = []
  let changeId = 0
  let i = 0

  while (i < parts.length) {
    const part = parts[i]

    if (!part.added && !part.removed) {
      blocks.push({ type: 'context', text: part.value })
      i++
      continue
    }

    let removedText = ''
    let addedText = ''

    while (i < parts.length && parts[i].removed) {
      removedText += parts[i].value
      i++
    }
    while (i < parts.length && parts[i].added) {
      addedText += parts[i].value
      i++
    }

    blocks.push({ type: 'change', id: changeId++, original: removedText, suggested: addedText, applied: false })
  }

  return blocks
}

export function hasChanges(blocks: DiffBlock[]): boolean {
  return blocks.some((block) => block.type === 'change')
}

export function renderContent(blocks: DiffBlock[]): string {
  return blocks
    .map((block) => (block.type === 'context' ? block.text : block.applied ? block.suggested : block.original))
    .join('')
}
