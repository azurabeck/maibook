import { create } from 'zustand'
import type { BookProject, Chapter } from '@/types'
import { renameProject, subscribeToProject } from '@/services/firestore/projects'
import {
  createChapter,
  deleteChapterInFirestore,
  renameChapterInFirestore,
  subscribeToChapters,
  updateChapterContentInFirestore,
} from '@/services/firestore/chapters'

// #region Debounce da gravação de conteúdo
// Cada tecla digitada no editor não pode virar uma escrita no
// Firestore (custo e limite de escritas, além de deixar tudo lento).
// Guardamos um timer por capítulo aqui fora do estado da store —
// isso não precisa (e não deve) disparar re-render de ninguém.
const CONTENT_SAVE_DEBOUNCE_MS = 800
const contentSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()
// #endregion

// #region Status de carregamento do projeto
// 'idle'      -> nenhum projeto sendo observado ainda
// 'loading'   -> aguardando o primeiro retorno do Firestore
// 'ready'     -> projeto encontrado e carregado
// 'not-found' -> documento não existe (id errado ou sem permissão)
export type ProjectStatus = 'idle' | 'loading' | 'ready' | 'not-found'
// #endregion

// #region Tipos do estado
interface ProjectState {
  currentProject: BookProject | null
  projectStatus: ProjectStatus
  chapters: Chapter[]
  activeChapterId: string | null
  savingChapterId: string | null // id do capítulo com escrita pendente/em andamento
  chaptersError: string | null // última falha ao ler/escrever capítulos (ex: permissão negada)

  // conecta a store ao Firestore para um projeto específico (chamado
  // pelo ProjectLayout ao entrar em /projeto/:projectId)
  loadProject: (projectId: string) => void
  // desconecta os listeners do Firestore (chamado ao sair do projeto)
  unloadProject: () => void

  setActiveChapter: (chapterId: string | null) => void
  updateChapterContent: (chapterId: string, content: string) => void
  addChapter: () => Promise<void>
  renameChapter: (chapterId: string, newTitle: string) => void
  deleteChapter: (chapterId: string) => void
  renameCurrentProject: (newTitle: string) => void
}
// #endregion

// Guardamos as funções de "unsubscribe" fora do estado da store —
// são só um detalhe de infraestrutura, não algo que a UI precisa ler.
let unsubscribeProject: (() => void) | null = null
let unsubscribeChapters: (() => void) | null = null

export const useProjectStore = create<ProjectState>((set, get) => ({
  currentProject: null,
  projectStatus: 'idle',
  chapters: [],
  activeChapterId: null,
  savingChapterId: null,
  chaptersError: null,

  // #region Conectar/desconectar o projeto ativo
  loadProject: (projectId) => {
    // se já tinha um projeto sendo observado, encerra os listeners
    // antigos antes de abrir os novos (evita vazamento e dados cruzados)
    get().unloadProject()

    set({
      projectStatus: 'loading',
      currentProject: null,
      chapters: [],
      activeChapterId: null,
    })

    unsubscribeProject = subscribeToProject(projectId, (project) => {
      if (!project) {
        set({ projectStatus: 'not-found' })
        return
      }
      set({ currentProject: project, projectStatus: 'ready' })
    })

    unsubscribeChapters = subscribeToChapters(projectId, (chapters) => {
      set((state) => {
        // mantém o capítulo ativo se ele ainda existir na lista nova;
        // senão, cai pro primeiro capítulo disponível
        const stillExists = chapters.some((ch) => ch.id === state.activeChapterId)
        return {
          chapters,
          activeChapterId: stillExists ? state.activeChapterId : (chapters[0]?.id ?? null),
        }
      })
    })
  },

  unloadProject: () => {
    unsubscribeProject?.()
    unsubscribeChapters?.()
    unsubscribeProject = null
    unsubscribeChapters = null
    contentSaveTimers.forEach((timer) => clearTimeout(timer))
    contentSaveTimers.clear()
  },
  // #endregion

  // marca qual capítulo está sendo editado agora
  setActiveChapter: (chapterId) => set({ activeChapterId: chapterId }),

  // atualiza o texto na tela imediatamente (otimista) e agenda a
  // gravação no Firestore com debounce, pra não escrever a cada tecla
  updateChapterContent: (chapterId, content) => {
    set((state) => ({
      chapters: state.chapters.map((ch) => (ch.id === chapterId ? { ...ch, content } : ch)),
    }))

    const projectId = get().currentProject?.id
    if (!projectId) return

    const existingTimer = contentSaveTimers.get(chapterId)
    if (existingTimer) clearTimeout(existingTimer)

    set({ savingChapterId: chapterId })

    const timer = setTimeout(() => {
      updateChapterContentInFirestore(projectId, chapterId, content)
        .catch((error) => console.error('Falha ao salvar capítulo:', error))
        .finally(() => {
          // só limpa o indicador de "salvando" se ninguém mais digitou
          // enquanto isso (senão já existe um novo timer rodando)
          if (get().savingChapterId === chapterId) set({ savingChapterId: null })
        })
      contentSaveTimers.delete(chapterId)
    }, CONTENT_SAVE_DEBOUNCE_MS)

    contentSaveTimers.set(chapterId, timer)
  },

  // cria um novo capítulo no Firestore, já dentro do projeto atual,
  // e o seleciona assim que o id vier de volta
  addChapter: async () => {
    const projectId = get().currentProject?.id
    if (!projectId) return

    const nextOrder = get().chapters.length + 1
    const title = `Capítulo ${String(nextOrder).padStart(2, '0')}`

    set({ chaptersError: null })

    try {
      const newChapterId = await createChapter(projectId, nextOrder, title)
      set({ activeChapterId: newChapterId })
    } catch (error) {
      // motivo mais comum pra cair aqui: as Security Rules do
      // Firestore ainda não liberam escrita na subcoleção
      // "chapters" (ver firestore.rules na raiz do projeto e
      // publicar em Firebase Console > Firestore Database > Regras)
      console.error('Falha ao criar capítulo:', error)
      set({
        chaptersError:
          'Não consegui criar o capítulo. Verifique as regras do Firestore (permissão negada) e sua conexão.',
      })
    }
  },

  // troca o título na tela na hora (otimista) e grava no Firestore
  renameChapter: (chapterId, newTitle) => {
    const projectId = get().currentProject?.id

    set((state) => ({
      chapters: state.chapters.map((ch) => (ch.id === chapterId ? { ...ch, title: newTitle } : ch)),
    }))

    if (!projectId) return
    renameChapterInFirestore(projectId, chapterId, newTitle).catch((error) =>
      console.error('Falha ao renomear capítulo:', error),
    )
  },

  // remove da tela na hora (otimista) e apaga no Firestore
  deleteChapter: (chapterId) => {
    const projectId = get().currentProject?.id

    set((state) => {
      const remaining = state.chapters.filter((ch) => ch.id !== chapterId)
      const wasActive = state.activeChapterId === chapterId
      return {
        chapters: remaining,
        activeChapterId: wasActive ? (remaining[0]?.id ?? null) : state.activeChapterId,
      }
    })

    const timer = contentSaveTimers.get(chapterId)
    if (timer) {
      clearTimeout(timer)
      contentSaveTimers.delete(chapterId)
    }

    if (!projectId) return
    deleteChapterInFirestore(projectId, chapterId).catch((error) =>
      console.error('Falha ao deletar capítulo:', error),
    )
  },

  // renomeia o projeto (livro) atual: atualiza a tela na hora
  // (otimista) e grava no Firestore
  renameCurrentProject: (newTitle) => {
    const project = get().currentProject
    if (!project) return

    set({ currentProject: { ...project, title: newTitle } })

    renameProject(project.id, newTitle).catch((error) =>
      console.error('Falha ao renomear projeto:', error),
    )
  },
}))
