import { create } from 'zustand'
import type { BookProject, Chapter } from '@/types'

// #region Dados de exemplo
// Enquanto a integração de capítulos com o Firestore não existe,
// usamos alguns capítulos "mockados" só pra ter algo na tela.
// Quando plugarmos o Firestore de verdade, isso sai daqui.
const MOCK_CHAPTERS: Chapter[] = [
  { id: 'cap-01', projectId: 'mock', title: 'Capítulo 01', order: 1, content: '' },
  { id: 'cap-02', projectId: 'mock', title: 'Capítulo 02', order: 2, content: '' },
  { id: 'cap-03', projectId: 'mock', title: 'Capítulo 03', order: 3, content: '' },
  { id: 'cap-04', projectId: 'mock', title: 'Capítulo 04', order: 4, content: '' },
  { id: 'cap-05', projectId: 'mock', title: 'Capítulo 05', order: 5, content: '' },
  { id: 'cap-06', projectId: 'mock', title: 'Capítulo 06', order: 6, content: '' },
  {
    id: 'cap-12',
    projectId: 'mock',
    title: 'Capítulo 12',
    order: 12,
    content:
      'O vento frio soprou do norte quando a pequena comitiva avistou, ao longe, as muralhas cinzentas de Demeres. A cidade parecia adormecida sob um céu encoberto, como se o próprio mundo prendesse a respiração.\n\nTomas apertou o capuz enquanto Ceren observava em silêncio. Eles não sabiam que aquele seria o início de uma série de eventos que mudaria o destino de todos.',
  },
]
// #endregion

// #region Tipos do estado
interface ProjectState {
  currentProject: BookProject | null
  chapters: Chapter[]
  activeChapterId: string | null

  setCurrentProject: (project: BookProject | null) => void
  setChapters: (chapters: Chapter[]) => void
  setActiveChapter: (chapterId: string | null) => void
  updateChapterContent: (chapterId: string, content: string) => void
  addChapter: () => void
  renameChapter: (chapterId: string, newTitle: string) => void
  deleteChapter: (chapterId: string) => void
}
// #endregion

// #region Store (Zustand)
// Zustand é bem mais simples que Redux: um único hook guarda o
// estado e as ações que o alteram. Qualquer componente pode ler ou
// atualizar esse estado global sem precisar de Provider/reducers.
export const useProjectStore = create<ProjectState>((set) => ({
  currentProject: null,
  chapters: MOCK_CHAPTERS,
  activeChapterId: 'cap-12',

  // define qual é o projeto (livro) aberto no momento
  setCurrentProject: (project) => set({ currentProject: project }),

  // substitui a lista inteira de capítulos (ex: após buscar do Firestore)
  setChapters: (chapters) => set({ chapters }),

  // marca qual capítulo está sendo editado agora
  setActiveChapter: (chapterId) => set({ activeChapterId: chapterId }),

  // atualiza o texto de um capítulo específico, sem mexer nos outros
  updateChapterContent: (chapterId, content) =>
    set((state) => ({
      chapters: state.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, content } : ch,
      ),
    })),

  // cria um novo capítulo vazio no fim da lista e já o seleciona
  addChapter: () =>
    set((state) => {
      const nextOrder = state.chapters.length + 1
      const newChapter: Chapter = {
        id: `cap-${Date.now()}`,
        projectId: state.currentProject?.id ?? 'mock',
        title: `Capítulo ${String(nextOrder).padStart(2, '0')}`,
        order: nextOrder,
        content: '',
      }
      return {
        chapters: [...state.chapters, newChapter],
        activeChapterId: newChapter.id,
      }
    }),

  // troca só o título de um capítulo específico
  renameChapter: (chapterId, newTitle) =>
    set((state) => ({
      chapters: state.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, title: newTitle } : ch,
      ),
    })),

  // remove um capítulo da lista; se ele estava ativo, seleciona outro no lugar
  deleteChapter: (chapterId) =>
    set((state) => {
      const remaining = state.chapters.filter((ch) => ch.id !== chapterId)
      const wasActive = state.activeChapterId === chapterId
      return {
        chapters: remaining,
        activeChapterId: wasActive ? (remaining[0]?.id ?? null) : state.activeChapterId,
      }
    }),
}))
// #endregion
