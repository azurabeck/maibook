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

export interface Chapter {
  id: string
  projectId: string
  title: string
  order: number // usado pra ordenação dos capítulos
  content: string // texto do capítulo (rich text serializado, ex: HTML/JSON do editor)
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
