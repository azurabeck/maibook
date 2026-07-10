import type { PageFormat } from '@/types'

export interface PageFormatDefinition {
  id: PageFormat
  name: string
  size: string
  width: number
  height: number
}

export const PAGE_FORMATS: PageFormatDefinition[] = [
  { id: 'a4', name: 'A4', size: '210 × 297 mm', width: 210, height: 297 },
  { id: 'a5', name: 'A5', size: '148 × 210 mm', width: 148, height: 210 },
  { id: 'a6', name: 'A6', size: '105 × 148 mm', width: 105, height: 148 },
  { id: 'trade', name: 'Trade', size: '152 × 229 mm', width: 152, height: 229 },
  { id: 'royal', name: 'Royal', size: '156 × 234 mm', width: 156, height: 234 },
  { id: 'demi', name: 'Demi', size: '138 × 216 mm', width: 138, height: 216 },
]

export function getPageFormat(pageFormat: PageFormat) {
  return PAGE_FORMATS.find((format) => format.id === pageFormat) ?? PAGE_FORMATS[1]
}
