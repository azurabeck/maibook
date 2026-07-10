// Aqui centralizamos os "formatos" (shapes) dos dados do app.
// Em TS, isso se chama "interface" (ou "type") — define quais campos
// um objeto deve ter e de que tipo. O TS te avisa em tempo de
// desenvolvimento se você usar um campo errado ou esquecer um.

export interface BookProject {
  id: string
  ownerId: string // uid do usuário dono do projeto (vem do Firebase Auth)
  title: string
  createdAt: number // timestamp em ms
  updatedAt: number
  headerText?: string // texto de cabeçalho padrão do livro
  footerText?: string // texto de rodapé padrão do livro
}

export interface ChapterHeader extends HeaderStructureDraft {
  sourceStructureId: string
  sourceStructureName: string
}

export interface ChapterGrid extends GridStructureDraft {
  sourceStructureId: string
  sourceStructureName: string
}

export interface ChapterFooter extends FooterStructureDraft {
  sourceStructureId: string
  sourceStructureName: string
}

export interface Chapter {
  id: string
  projectId: string
  title: string
  order: number // usado pra ordenação dos capítulos
  content: string // texto do capítulo (rich text serializado, ex: HTML/JSON do editor)
  header?: ChapterHeader
  grid?: ChapterGrid
  footer?: ChapterFooter
}

export interface Character {
  id: string
  projectId: string
  name: string
  description?: string
  imageUrl?: string
  traits?: string[] // ex: ["corajoso", "impulsivo"]
}

export interface BookLocation {
  id: string
  projectId: string
  name: string
  description?: string
  imageUrl?: string
}

export interface TimelineEvent {
  id: string
  projectId: string
  characterId?: string
  title: string
  date?: string // pode ser uma data fictícia do universo do livro
  description?: string
}

// Tipo utilitário: representa o resultado de uma chamada de IA,
// seja revisão gramatical, sugestão de ideia, etc.
export interface AiSuggestion {
  id: string
  type: 'grammar' | 'idea' | 'other'
  originalText: string
  suggestion: string
  createdAt: number
}

export type HeaderAlignment = 'left' | 'center' | 'right'
export type HeaderImageObjectFit = 'contain' | 'cover' | 'fill'

export type HeaderStructureLayout =
  | 'image-text'
  | 'text-only'
  | 'text-text'
  | 'image-only'

export interface HeaderStructureDraft {
  name: string
  layout: HeaderStructureLayout
  primaryText: string
  secondaryText: string
  imageUrl: string
  imageHeight: number
  imageWidth: number
  imageObjectFit: HeaderImageObjectFit
  textAlignment: HeaderAlignment
  imageAlignment: HeaderAlignment
  fontSize: number
  secondaryFontSize: number
  fontFamily: string
  bold: boolean
  rowGap: number
  textStartSpacing: number
  borderTop: boolean
  borderBottom: boolean
}

export interface HeaderStructure extends HeaderStructureDraft {
  id: string
  projectId: string
  createdAt: number
  updatedAt: number
}

export type PageFormat = 'a4' | 'a5' | 'a6' | 'royal' | 'demi' | 'trade'
export type PageOrientation = 'portrait' | 'landscape'
export type TextAlignment = 'left' | 'justify'

export interface GridStructureDraft {
  name: string
  pageFormat: PageFormat
  orientation: PageOrientation
  columns: 1 | 2
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  columnGap: number
  fontFamily: string
  fontSize: number
  lineHeight: number
  paragraphSpacing: number
  firstLineIndent: number
  textAlignment: TextAlignment
  hyphenation: boolean
  widowsAndOrphans: boolean
}

export interface GridStructure extends GridStructureDraft {
  id: string
  projectId: string
  createdAt: number
  updatedAt: number
}

export type FooterElementType = 'note' | 'chapter-title' | 'page-number'
export type FooterPosition = 'left' | 'center' | 'right'
export type FooterStructureLayout = 'number' | 'note-number' | 'note-chapter-number' | 'chapter-number'

export interface FooterStructureItem {
  type: FooterElementType
  position: FooterPosition
}

export interface FooterStructureDraft {
  name: string
  layout: FooterStructureLayout
  noteText: string
  items: FooterStructureItem[]
  fontFamily: string
  fontSize: number
  borderTop: boolean
  spacingTop: number
}

export interface FooterStructure extends FooterStructureDraft {
  id: string
  projectId: string
  createdAt: number
  updatedAt: number
}
