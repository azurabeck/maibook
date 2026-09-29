import { useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookMarked,
  Check,
  GripVertical,
  Heart,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Folder,
  FolderPlus,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  ChevronDown,
  Shapes,
  Sunrise,
  Sunset,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { updateSections } from '@/services/firestore/projects'
import type { ChapterOrderUpdate } from '@/services/firestore/chapters'
import type { BookSection, BookSectionKind, Chapter, ChapterPageType } from '@/types'
import {
  MAIN_SECTION_ID,
  chapterSectionId,
  groupChaptersByParent,
  resolveBookSections,
  sectionShowsInSummary,
} from '@/utils/chapterTree'
import { chapterListPanelCss } from './css'

// Chave do localStorage que guarda quais capítulos-pai (e seções)
// estão recolhidos — é só uma conveniência visual por navegador, não
// precisa ir pro Firestore (nada muda pra quem mais acessa o projeto).
function collapsedChaptersStorageKey(projectId: string) {
  return `maibook-collapsed-chapters:${projectId}`
}

// #region Árvore de capítulos (aninhamento tipo Figma)
// Qualquer capítulo pode virar "pai" de outros — arrastando um em
// cima do outro na lista. `order` é único só entre irmãos (mesmo
// parentId), não um índice global: por isso a árvore inteira precisa
// ser reconstruída (agrupar por parentId, ordenar cada grupo) toda
// vez que a lista renderiza, em vez de só ordenar um array plano.
interface ChapterTreeRow {
  chapter: Chapter
  depth: number
  hasChildren: boolean
}

// Árvore de uma seção: só os capítulos raiz daquela seção (e tudo que
// estiver aninhado neles).
function buildChapterTree(chapters: Chapter[], collapsedIds: Set<string>, roots: Chapter[]): ChapterTreeRow[] {
  const childrenByParent = groupChaptersByParent(chapters)
  const rows: ChapterTreeRow[] = []

  function visit(list: Chapter[], depth: number) {
    for (const chapter of list) {
      const children = childrenByParent.get(chapter.id) ?? []
      rows.push({ chapter, depth, hasChildren: children.length > 0 })
      if (children.length > 0 && !collapsedIds.has(chapter.id)) {
        visit(children, depth + 1)
      }
    }
  }

  visit(roots, 0)
  return rows
}

// true se `chapterId` está dentro da subárvore de `ancestorId`
// (usado pra não deixar soltar um capítulo dentro dele mesmo ou de
// um dos seus próprios descendentes — isso criaria um ciclo)
function isDescendantOf(chapterId: string, ancestorId: string, chapters: Chapter[]): boolean {
  const byId = new Map(chapters.map((chapter) => [chapter.id, chapter]))
  let current = byId.get(chapterId)
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true
    current = byId.get(current.parentId)
  }
  return false
}
// #endregion

type DropPosition = 'before' | 'after' | 'inside'

// Páginas que dá pra criar dentro de um grupo (menu ⋮ do grupo) — ver
// ChapterPageType.
const NEW_PAGE_OPTIONS: Array<{ pageType: ChapterPageType; label: string; icon: typeof FileText }> = [
  { pageType: 'text', label: 'Nova página de texto', icon: FileText },
  { pageType: 'image', label: 'Nova página de imagem inteira', icon: ImageIcon },
  { pageType: 'background', label: 'Nova página de texto com fundo', icon: Layers },
]

// nome inicial de um grupo novo (já abre pra renomear)
const NEW_GROUP_TITLE = 'Novo grupo'

// Seções extras que dá pra adicionar ao livro. Prólogo entra logo
// antes de "Capítulos" e Epílogo logo depois; Dedicatória no topo; o
// resto no fim (dá pra arrastar pra onde quiser depois).
const NEW_SECTION_OPTIONS: Array<{ kind: BookSectionKind; label: string; hint: string; icon: typeof FileText }> = [
  { kind: 'prologue', label: 'Prólogo', hint: 'Como os capítulos, mas sem contar como capítulo', icon: Sunrise },
  { kind: 'epilogue', label: 'Epílogo', hint: 'Como os capítulos, mas sem contar como capítulo', icon: Sunset },
  { kind: 'dedication', label: 'Dedicatória', hint: 'Fica fora do sumário', icon: Heart },
  { kind: 'glossary', label: 'Glossário', hint: 'Termos, nomes e lugares do livro', icon: BookMarked },
  { kind: 'other', label: 'Outros', hint: 'Agradecimentos, epígrafe, apêndice...', icon: Shapes },
]

export function ChapterListPanel() {
  // pega do store o projeto atual, a lista de capítulos, qual está
  // ativo, e as ações disponíveis
  const {
    currentProject,
    chapters,
    activeChapterId,
    setActiveChapter,
    addChapter,
    renameProject,
    renameChapter,
    deleteChapter,
    reorderChapters,
  } = useProjectStore()
  const navigate = useNavigate()
  const sections = resolveBookSections(currentProject?.sections)

  // #region Estado do menu de contexto (3 pontinhos)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [draggedChapterId, setDraggedChapterId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition>('before')
  const [reordering, setReordering] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  // #endregion

  // #region Estado das seções (menu, renomear, arrastar)
  const [openSectionMenuId, setOpenSectionMenuId] = useState<string | null>(null)
  const [renamingSectionId, setRenamingSectionId] = useState<string | null>(null)
  const [sectionRenameValue, setSectionRenameValue] = useState('')
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null)
  const [sectionDropTarget, setSectionDropTarget] = useState<{ id: string; position: DropPosition } | null>(null)
  const sectionMenuRef = useRef<HTMLDivElement>(null)
  // #endregion

  // #region Estado dos popovers "Nova seção" e "+" das seções extras
  const [newSectionMenuOpen, setNewSectionMenuOpen] = useState(false)
  const newSectionMenuRef = useRef<HTMLDivElement>(null)
  const [addMenuSectionId, setAddMenuSectionId] = useState<string | null>(null)
  const addMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!addMenuSectionId) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setAddMenuSectionId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [addMenuSectionId])

  useEffect(() => {
    if (!newSectionMenuOpen) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (newSectionMenuRef.current && !newSectionMenuRef.current.contains(event.target as Node)) {
        setNewSectionMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [newSectionMenuOpen])

  // Página nova dentro de um grupo (o que o antigo "Novo Capítulo" fazia)
  async function handleAddPageToGroup(group: Chapter, pageType: ChapterPageType) {
    setOpenMenuId(null)
    await addChapter(pageType, { parentId: group.id })
    expand(group.id)
  }
  // #endregion

  // #region Capítulos-pai recolhidos — só uma preferência visual
  // salva no localStorage, por projeto
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!currentProject) return
    try {
      const raw = localStorage.getItem(collapsedChaptersStorageKey(currentProject.id))
      setCollapsedIds(raw ? new Set(JSON.parse(raw)) : new Set())
    } catch {
      setCollapsedIds(new Set())
    }
  }, [currentProject?.id])

  useEffect(() => {
    if (!currentProject) return
    try {
      localStorage.setItem(collapsedChaptersStorageKey(currentProject.id), JSON.stringify([...collapsedIds]))
    } catch {
      // localStorage indisponível (aba anônima, etc.) — não é crítico, ignora
    }
  }, [collapsedIds, currentProject?.id])

  function toggleCollapsed(key: string) {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function expand(key: string) {
    setCollapsedIds((current) => {
      if (!current.has(key)) return current
      const next = new Set(current)
      next.delete(key)
      return next
    })
  }
  // #endregion

  // #region Estado do menu de contexto do projeto (3 pontinhos)
  const [projectMenuOpen, setProjectMenuOpen] = useState(false)
  const [renamingProject, setRenamingProject] = useState(false)
  const [projectRenameValue, setProjectRenameValue] = useState('')
  const projectMenuRef = useRef<HTMLDivElement>(null)
  // #endregion

  // #region Fechar os menus ao clicar fora deles
  useEffect(() => {
    // só precisa escutar cliques no documento enquanto algum menu está aberto
    if (!openMenuId) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  useEffect(() => {
    if (!openSectionMenuId) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (sectionMenuRef.current && !sectionMenuRef.current.contains(event.target as Node)) {
        setOpenSectionMenuId(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openSectionMenuId])

  useEffect(() => {
    if (!projectMenuOpen) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (projectMenuRef.current && !projectMenuRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [projectMenuOpen])
  // #endregion

  // #region Ações do menu do projeto
  function toggleProjectMenu(event: ReactMouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    setProjectMenuOpen((current) => !current)
  }

  function startProjectRename() {
    setProjectRenameValue(currentProject?.title ?? '')
    setRenamingProject(true)
    setProjectMenuOpen(false)
  }

  function commitProjectRename() {
    if (projectRenameValue.trim()) {
      renameProject(projectRenameValue.trim())
    }
    setRenamingProject(false)
  }
  // #endregion

  // #region Ações do menu
  // abre/fecha o menu do capítulo clicado, sem selecionar o capítulo
  function toggleMenu(event: ReactMouseEvent<HTMLButtonElement>, chapterId: string) {
    event.stopPropagation()
    setOpenMenuId((current) => (current === chapterId ? null : chapterId))
  }

  // entra no modo de edição do título, preenchendo o valor atual
  function startRename(chapterId: string, currentTitle: string) {
    setRenamingId(chapterId)
    setRenameValue(currentTitle)
    setOpenMenuId(null)
  }

  // salva o novo título (ignora se ficou vazio) e sai do modo de edição
  function commitRename(chapterId: string) {
    if (renameValue.trim()) {
      renameChapter(chapterId, renameValue.trim())
    }
    setRenamingId(null)
  }

  // pede confirmação e remove o capítulo da lista
  function handleDelete(chapterId: string, title: string) {
    setOpenMenuId(null)
    const confirmed = window.confirm(`Deletar "${title}"? Essa ação não pode ser desfeita.`)
    if (confirmed) deleteChapter(chapterId)
  }
  // #endregion

  // #region Seções: criar, renomear, remover, sumário
  async function saveSections(next: BookSection[]) {
    if (!currentProject) return
    try {
      await updateSections(currentProject.id, next)
    } catch (error) {
      console.error('Falha ao salvar seções:', error)
      window.alert('Não foi possível salvar as seções do livro. Tente novamente.')
    }
  }

  // Cria a seção e já uma primeira página com o mesmo nome (menos em
  // "Outros", que costuma ter páginas de nomes variados).
  async function handleAddSection(kind: BookSectionKind, label: string) {
    setNewSectionMenuOpen(false)
    let title = label
    if (kind === 'other') {
      const typed = window.prompt('Nome da seção (ex.: Agradecimentos, Epígrafe, Apêndice):', 'Outros')
      if (typed === null) return
      title = typed.trim() || 'Outros'
    }
    const section: BookSection = { id: `${kind}-${Date.now().toString(36)}`, kind, title }
    const mainIndex = sections.findIndex((item) => item.id === MAIN_SECTION_ID)
    const next = [...sections]
    if (kind === 'dedication') next.unshift(section)
    else if (kind === 'prologue') next.splice(mainIndex, 0, section)
    else if (kind === 'epilogue') next.splice(mainIndex + 1, 0, section)
    else next.push(section)
    await saveSections(next)

    // Já existe um grupo "Prólogo"/"Epílogo" dentro de Capítulos? Ele
    // (com tudo que tem dentro) passa pra seção nova, em vez de criar
    // uma página repetida.
    const normalize = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase()
    const existing = (kind === 'prologue' || kind === 'epilogue')
      ? sectionRoots(MAIN_SECTION_ID).find((chapter) => normalize(chapter.title) === normalize(title))
      : undefined
    if (existing) {
      await saveChapterOrder([{ id: existing.id, order: 1, sectionId: section.id }])
      return
    }
    if (kind !== 'other') await addChapter('text', { sectionId: section.id, title })
  }

  // Grupo novo (tipo "Ato 05") numa seção: já entra no modo renomear
  async function addGroupToSection(section: BookSection) {
    setAddMenuSectionId(null)
    const id = await addChapter('text', { sectionId: section.id, title: NEW_GROUP_TITLE })
    if (id) startRename(id, NEW_GROUP_TITLE)
  }

  // Página de texto solta na seção (ex.: o texto do glossário)
  function addPageToSection(section: BookSection) {
    setAddMenuSectionId(null)
    const count = chapters.filter((chapter) => !chapter.parentId && chapterSectionId(chapter, chapters, sections) === section.id).length
    void addChapter('text', { sectionId: section.id, title: count ? `${section.title} ${count + 1}` : section.title })
  }

  function toggleSectionMenu(event: ReactMouseEvent<HTMLButtonElement>, sectionId: string) {
    event.stopPropagation()
    setOpenSectionMenuId((current) => (current === sectionId ? null : sectionId))
  }

  function startSectionRename(section: BookSection) {
    setRenamingSectionId(section.id)
    setSectionRenameValue(section.title)
    setOpenSectionMenuId(null)
  }

  function commitSectionRename(sectionId: string) {
    const title = sectionRenameValue.trim()
    setRenamingSectionId(null)
    if (!title) return
    void saveSections(sections.map((section) => (section.id === sectionId ? { ...section, title } : section)))
  }

  function toggleAddMenu(event: ReactMouseEvent<HTMLButtonElement>, sectionId: string) {
    event.stopPropagation()
    setAddMenuSectionId((current) => (current === sectionId ? null : sectionId))
  }

  function toggleSectionInSummary(section: BookSection) {
    setOpenSectionMenuId(null)
    const showInSummary = !sectionShowsInSummary(section)
    void saveSections(sections.map((item) => (item.id === section.id ? { ...item, showInSummary } : item)))
  }

  // Remove a seção; as páginas dela não são apagadas — voltam pra
  // seção principal "Capítulos".
  async function handleRemoveSection(section: BookSection) {
    setOpenSectionMenuId(null)
    const roots = chapters.filter((chapter) => !chapter.parentId && chapterSectionId(chapter, chapters, sections) === section.id)
    const message = roots.length
      ? `Remover a seção "${section.title}"? As ${roots.length} página(s) dela vão para "Capítulos".`
      : `Remover a seção "${section.title}"?`
    if (!window.confirm(message)) return

    if (roots.length) {
      const mainRoots = chapters
        .filter((chapter) => !chapter.parentId && chapterSectionId(chapter, chapters, sections) === MAIN_SECTION_ID)
        .sort((a, b) => a.order - b.order)
      const moved = [...mainRoots, ...roots.sort((a, b) => a.order - b.order)]
      await reorderChapters(moved.map((chapter, index) => ({
        id: chapter.id,
        order: index + 1,
        ...(roots.includes(chapter) ? { sectionId: null } : {}),
      })))
    }
    await saveSections(sections.filter((item) => item.id !== section.id))
  }

  function openSummarySettings() {
    if (!currentProject) return
    navigate(`/projeto/${currentProject.id}/estruturas?secao=${encodeURIComponent('Sumário')}`)
  }
  // #endregion

  // #region Arrastar e soltar capítulos — reordena como irmão
  // (antes/depois) ou aninha como filho (em cima), igual ao painel de
  // camadas do Figma. Soltar no título de uma seção move pra ela.
  function handleDragStart(event: ReactDragEvent<HTMLButtonElement>, chapterId: string) {
    if (renamingId || reordering) {
      event.preventDefault()
      return
    }

    setDraggedChapterId(chapterId)
    setOpenMenuId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', chapterId)
  }

  function handleDragOver(event: ReactDragEvent<HTMLLIElement>, chapterId: string) {
    if (!draggedChapterId) return

    // não deixa soltar em cima de si mesmo ou de um dos próprios
    // descendentes — isso criaria um ciclo na árvore
    if (chapterId === draggedChapterId || isDescendantOf(chapterId, draggedChapterId, chapters)) {
      return
    }

    event.preventDefault()

    const bounds = event.currentTarget.getBoundingClientRect()
    const ratio = (event.clientY - bounds.top) / bounds.height
    const position: DropPosition = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside'

    setDropTargetId(chapterId)
    setDropPosition(position)
    event.dataTransfer.dropEffect = 'move'
  }

  async function saveChapterOrder(updates: ChapterOrderUpdate[], expandKey?: string) {
    setReordering(true)
    try {
      await reorderChapters(updates)
      if (expandKey) expand(expandKey)
    } catch {
      window.alert('Não foi possível salvar a nova ordem dos capítulos.')
    } finally {
      setReordering(false)
    }
  }

  // capítulos raiz de uma seção, em ordem (sem o que está sendo movido)
  function sectionRoots(sectionId: string, excludeId?: string) {
    return chapters
      .filter((chapter) => chapter.id !== excludeId && !chapter.parentId && chapterSectionId(chapter, chapters, sections) === sectionId)
      .sort((a, b) => a.order - b.order)
  }

  async function handleDrop(event: ReactDragEvent<HTMLLIElement>, targetChapterId: string) {
    event.preventDefault()
    const sourceChapterId = draggedChapterId || event.dataTransfer.getData('text/plain')
    const position = dropTargetId === targetChapterId ? dropPosition : 'before'
    resetDragState()

    if (!sourceChapterId || sourceChapterId === targetChapterId) return

    const source = chapters.find((chapter) => chapter.id === sourceChapterId)
    const target = chapters.find((chapter) => chapter.id === targetChapterId)
    if (!source || !target) return

    // pra onde o capítulo arrastado vai: dentro do alvo (novo pai) ou
    // como irmão dele (mesmo pai que o alvo)
    const newParentId = position === 'inside' ? target.id : target.parentId

    // trava de segurança: não deixa aninhar dentro de si mesmo ou de
    // um descendente (o handleDragOver já evita isso, mas o
    // dataTransfer pode vir de um estado diferente do state atual)
    if (newParentId && (newParentId === sourceChapterId || isDescendantOf(newParentId, sourceChapterId, chapters))) {
      return
    }

    // capítulo raiz: os irmãos são só os raiz da mesma seção do alvo
    const targetSectionId = chapterSectionId(target, chapters, sections)
    const siblings = newParentId
      ? chapters
        .filter((chapter) => chapter.id !== sourceChapterId && chapter.parentId === newParentId)
        .sort((a, b) => a.order - b.order)
      : sectionRoots(targetSectionId, sourceChapterId)

    let insertIndex = siblings.length
    if (position !== 'inside') {
      const targetIndex = siblings.findIndex((chapter) => chapter.id === targetChapterId)
      insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
    }
    siblings.splice(insertIndex, 0, source)

    const updates: ChapterOrderUpdate[] = siblings.map((chapter, index) => ({
      id: chapter.id,
      order: index + 1,
      ...(chapter.id === sourceChapterId
        ? {
          parentId: newParentId ?? null,
          // virou raiz: grava a seção (a principal fica sem o campo)
          ...(newParentId ? {} : { sectionId: targetSectionId === MAIN_SECTION_ID ? null : targetSectionId }),
        }
        : {}),
    }))

    // expande o novo pai pra mostrar o capítulo recém-aninhado
    await saveChapterOrder(updates, position === 'inside' ? target.id : undefined)
  }

  // Soltou um capítulo no título de uma seção: vai pro fim dela, como raiz
  async function dropChapterOnSection(section: BookSection, sourceChapterId: string) {
    const source = chapters.find((chapter) => chapter.id === sourceChapterId)
    if (!source || section.kind === 'summary') return

    const siblings = [...sectionRoots(section.id, sourceChapterId), source]
    await saveChapterOrder(
      siblings.map((chapter, index) => ({
        id: chapter.id,
        order: index + 1,
        ...(chapter.id === sourceChapterId
          ? { parentId: null, sectionId: section.id === MAIN_SECTION_ID ? null : section.id }
          : {}),
      })),
    )
  }

  function resetDragState() {
    setDraggedChapterId(null)
    setDropTargetId(null)
    setDropPosition('before')
    setDraggedSectionId(null)
    setSectionDropTarget(null)
  }
  // #endregion

  // #region Arrastar e soltar seções — troca a ordem delas no livro
  function handleSectionDragStart(event: ReactDragEvent<HTMLButtonElement>, sectionId: string) {
    if (renamingSectionId || reordering) {
      event.preventDefault()
      return
    }
    setDraggedSectionId(sectionId)
    setOpenSectionMenuId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', `section:${sectionId}`)
  }

  function handleSectionDragOver(event: ReactDragEvent<HTMLDivElement>, section: BookSection) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const before = event.clientY - bounds.top < bounds.height / 2

    if (draggedSectionId) {
      if (draggedSectionId === section.id) return
      event.preventDefault()
      setSectionDropTarget({ id: section.id, position: before ? 'before' : 'after' })
      event.dataTransfer.dropEffect = 'move'
      return
    }

    // capítulo arrastado por cima do título da seção: move pra ela
    if (draggedChapterId && section.kind !== 'summary') {
      event.preventDefault()
      setSectionDropTarget({ id: section.id, position: 'inside' })
      event.dataTransfer.dropEffect = 'move'
    }
  }

  async function handleSectionDrop(event: ReactDragEvent<HTMLDivElement>, section: BookSection) {
    event.preventDefault()
    const target = sectionDropTarget?.id === section.id ? sectionDropTarget : null
    const movingSectionId = draggedSectionId
    const movingChapterId = draggedChapterId
    resetDragState()

    if (movingChapterId) {
      await dropChapterOnSection(section, movingChapterId)
      return
    }
    if (!movingSectionId || movingSectionId === section.id || !target) return

    const moving = sections.find((item) => item.id === movingSectionId)
    if (!moving) return
    const next = sections.filter((item) => item.id !== movingSectionId)
    const targetIndex = next.findIndex((item) => item.id === section.id)
    next.splice(target.position === 'after' ? targetIndex + 1 : targetIndex, 0, moving)
    await saveSections(next)
  }
  // #endregion

  function renderChapterRow({ chapter, depth, hasChildren }: ChapterTreeRow) {
    const isCollapsed = hasChildren && collapsedIds.has(chapter.id)
    const isDropTarget = dropTargetId === chapter.id
    const indentStyle = depth > 0 ? { marginLeft: depth * 14, paddingLeft: 10 } : undefined

    return (
      <li
        key={chapter.id}
        style={indentStyle}
        className={[
          chapterListPanelCss.chapterListRow,
          depth > 0 ? chapterListPanelCss.chapterListRowChild : '',
          draggedChapterId === chapter.id ? chapterListPanelCss.chapterListRowDragging : '',
          isDropTarget && dropPosition === 'before' ? chapterListPanelCss.chapterListRowDropBefore : '',
          isDropTarget && dropPosition === 'after' ? chapterListPanelCss.chapterListRowDropAfter : '',
          isDropTarget && dropPosition === 'inside' ? chapterListPanelCss.chapterListRowDropInside : '',
        ].filter(Boolean).join(' ')}
        onDragOver={(event) => handleDragOver(event, chapter.id)}
        onDragLeave={() => setDropTargetId((current) => (current === chapter.id ? null : current))}
        onDrop={(event) => void handleDrop(event, chapter.id)}
      >
        {renamingId === chapter.id ? (
          // #region Modo de edição do título
          <input
            className={chapterListPanelCss.chapterListRenameInput}
            value={renameValue}
            autoFocus
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={() => commitRename(chapter.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename(chapter.id)
              if (e.key === 'Escape') setRenamingId(null)
            }}
          />
          // #endregion
        ) : (
          <>
            {/* capítulos com filhos ganham um chevron pra recolher/expandir */}
            {hasChildren ? (
              <button
                className={chapterListPanelCss.chapterListExpandToggle}
                type="button"
                onClick={() => toggleCollapsed(chapter.id)}
                aria-label={isCollapsed ? `Expandir ${chapter.title}` : `Recolher ${chapter.title}`}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
            ) : (
              <span className={chapterListPanelCss.chapterListExpandSpacer} />
            )}

            <button
              className={chapterListPanelCss.chapterListDragHandle}
              type="button"
              draggable={!reordering}
              onDragStart={(event) => handleDragStart(event, chapter.id)}
              onDragEnd={resetDragState}
              aria-label={`Arrastar ${chapter.title}`}
              title="Arraste para reorganizar (solte em cima de outro capítulo para aninhar, ou no título de uma seção para mover pra ela)"
            >
              <GripVertical size={15} />
            </button>

            {/* clicar no título torna o capítulo "ativo" no editor */}
            <button
              className={
                chapter.id === activeChapterId
                  ? chapterListPanelCss.chapterListItemActive
                  : chapterListPanelCss.chapterListItem
              }
              onClick={() => setActiveChapter(chapter.id)}
            >
              {chapter.title}
            </button>

            {/* botão dos 3 pontinhos: separado do botão de seleção */}
            <button
              className={chapterListPanelCss.chapterListItemMenuTrigger}
              onClick={(e) => toggleMenu(e, chapter.id)}
              aria-label="Opções do capítulo"
            >
              <MoreVertical size={16} />
            </button>

            {/* #region Menu suspenso: Renomear / Nova página dentro / Deletar */}
            {openMenuId === chapter.id && (
              <div className={chapterListPanelCss.chapterListMenu} ref={menuRef}>
                <button onClick={() => startRename(chapter.id, chapter.title)}>
                  <Pencil size={14} /> Renomear
                </button>
                <hr className={chapterListPanelCss.menuDivider} />
                {NEW_PAGE_OPTIONS.map(({ pageType, label, icon: Icon }) => (
                  <button key={pageType} onClick={() => void handleAddPageToGroup(chapter, pageType)}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
                <hr className={chapterListPanelCss.menuDivider} />
                <button
                  className={chapterListPanelCss.danger}
                  onClick={() => handleDelete(chapter.id, chapter.title)}
                >
                  <Trash2 size={14} /> Deletar
                </button>
              </div>
            )}
            {/* #endregion */}
          </>
        )}
      </li>
    )
  }

  function renderSection(section: BookSection) {
    const isSummary = section.kind === 'summary'
    const isMain = section.id === MAIN_SECTION_ID
    const roots = isSummary ? [] : sectionRoots(section.id)
    const rows = buildChapterTree(chapters, collapsedIds, roots)
    const drop = sectionDropTarget?.id === section.id ? sectionDropTarget.position : null
    const canRemove = !isMain && !isSummary

    return (
      <div
        key={section.id}
        className={[
          chapterListPanelCss.section,
          isMain ? chapterListPanelCss.sectionMain : '',
          draggedSectionId === section.id ? chapterListPanelCss.chapterListRowDragging : '',
        ].filter(Boolean).join(' ')}
      >
        {/* #region Título da seção (arrastável; recebe capítulos soltos em cima) */}
        <div
          className={[
            chapterListPanelCss.sectionHeader,
            drop === 'before' ? chapterListPanelCss.chapterListRowDropBefore : '',
            drop === 'after' ? chapterListPanelCss.chapterListRowDropAfter : '',
            drop === 'inside' ? chapterListPanelCss.chapterListRowDropInside : '',
          ].filter(Boolean).join(' ')}
          onDragOver={(event) => handleSectionDragOver(event, section)}
          onDragLeave={() => setSectionDropTarget((current) => (current?.id === section.id ? null : current))}
          onDrop={(event) => void handleSectionDrop(event, section)}
        >
          <button
            className={chapterListPanelCss.sectionDragHandle}
            type="button"
            draggable={!reordering}
            onDragStart={(event) => handleSectionDragStart(event, section.id)}
            onDragEnd={resetDragState}
            aria-label={`Arrastar a seção ${section.title}`}
            title="Arraste para mudar a posição desta seção no livro"
          >
            <GripVertical size={13} />
          </button>

          {renamingSectionId === section.id ? (
            <input
              className={chapterListPanelCss.chapterListRenameInput}
              value={sectionRenameValue}
              autoFocus
              onChange={(e) => setSectionRenameValue(e.target.value)}
              onBlur={() => commitSectionRename(section.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitSectionRename(section.id)
                if (e.key === 'Escape') setRenamingSectionId(null)
              }}
            />
          ) : isSummary ? (
            <button type="button" className={chapterListPanelCss.sectionTitle} onClick={openSummarySettings} title="Configurar o sumário">
              <span>{section.title}</span>
              {!currentProject?.summary && <small>não configurado</small>}
            </button>
          ) : (
            <span
              className={chapterListPanelCss.sectionTitle}
              onDoubleClick={() => startSectionRename(section)}
              title="Dois cliques para renomear"
            >
              <span>{section.title}</span>
            </span>
          )}

          {/* ações que só aparecem no hover: renomear, aparecer no sumário */}
          <button
            className={chapterListPanelCss.sectionHoverAction}
            onClick={(e) => toggleSectionMenu(e, section.id)}
            aria-label={`Opções da seção ${section.title}`}
          >
            <MoreVertical size={14} />
          </button>

          {canRemove && (
            <button
              type="button"
              className={chapterListPanelCss.sectionAction}
              onClick={() => void handleRemoveSection(section)}
              aria-label={`Remover a seção ${section.title}`}
              title={`Remover a seção "${section.title}"`}
            >
              <Trash2 size={14} />
            </button>
          )}

          {isMain && (
            <button
              type="button"
              className={chapterListPanelCss.sectionAction}
              onClick={() => void addGroupToSection(section)}
              aria-label="Novo grupo de capítulos"
              title="Novo grupo de capítulos (ex.: Ato 05)"
            >
              <Plus size={15} />
            </button>
          )}

          {canRemove && (
            <button
              type="button"
              className={chapterListPanelCss.sectionAction}
              onClick={(e) => toggleAddMenu(e, section.id)}
              aria-label={`Adicionar em ${section.title}`}
              title={`Adicionar grupo ou página em "${section.title}"`}
            >
              <Plus size={15} />
            </button>
          )}

          {addMenuSectionId === section.id && (
            <div className={chapterListPanelCss.chapterListMenu} ref={addMenuRef}>
              <button onClick={() => void addGroupToSection(section)}>
                <Folder size={14} /> Novo grupo
              </button>
              <button onClick={() => addPageToSection(section)}>
                <FileText size={14} /> Nova página de texto
              </button>
            </div>
          )}

          {openSectionMenuId === section.id && (
            <div className={chapterListPanelCss.chapterListMenu} ref={sectionMenuRef}>
              {isSummary ? (
                <button onClick={() => { setOpenSectionMenuId(null); openSummarySettings() }}>
                  <Pencil size={14} /> Configurar sumário
                </button>
              ) : (
                <>
                  <button onClick={() => startSectionRename(section)}>
                    <Pencil size={14} /> Renomear seção
                  </button>
                  <button onClick={() => toggleSectionInSummary(section)}>
                    {sectionShowsInSummary(section) ? <Check size={14} /> : <span className={chapterListPanelCss.menuIconSpacer} />}
                    Aparecer no sumário
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        {/* #endregion */}

        {rows.length > 0 && (
          <ul className={chapterListPanelCss.chapterListItems}>
            {rows.map(renderChapterRow)}
          </ul>
        )}
      </div>
    )
  }

  return (
    <aside className={chapterListPanelCss.panel + ' ' + chapterListPanelCss.chapterList}>
      {/* #region Projeto atual */}
      <div className={chapterListPanelCss.chapterListProject}>
        <span className={chapterListPanelCss.chapterListProjectLabel}>Projeto atual</span>
        <div className={chapterListPanelCss.chapterListProjectRow}>
          {renamingProject ? (
            // #region Modo de edição do título do projeto
            <input
              className={chapterListPanelCss.chapterListRenameInput}
              value={projectRenameValue}
              autoFocus
              onChange={(e) => setProjectRenameValue(e.target.value)}
              onBlur={commitProjectRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitProjectRename()
                if (e.key === 'Escape') setRenamingProject(false)
              }}
            />
            // #endregion
          ) : (
            <>
              <span className={chapterListPanelCss.chapterListProjectName}>
                {currentProject?.title ?? 'Carregando...'}
              </span>

              {/* botão dos 3 pontinhos: abre o menu do projeto */}
              <button
                className={chapterListPanelCss.chapterListItemMenuTrigger}
                onClick={toggleProjectMenu}
                aria-label="Opções do projeto"
              >
                <MoreVertical size={16} />
              </button>

              {/* #region Menu suspenso: Renomear */}
              {projectMenuOpen && (
                <div className={chapterListPanelCss.chapterListMenu} ref={projectMenuRef}>
                  <button onClick={startProjectRename}>
                    <Pencil size={14} /> Renomear
                  </button>
                </div>
              )}
              {/* #endregion */}
            </>
          )}
        </div>
      </div>
      {/* #endregion */}

      {/* #region Seções do livro, na ordem de leitura */}
      <div className={chapterListPanelCss.sections}>
        {sections.map(renderSection)}
      </div>
      {/* #endregion */}

      {/* #region Nova seção (Dedicatória, Glossário, Outros) */}
      <div className={chapterListPanelCss.addRow} ref={newSectionMenuRef}>
        <button
          className={chapterListPanelCss.chapterListAdd}
          type="button"
          onClick={() => setNewSectionMenuOpen((current) => !current)}
        >
          <FolderPlus size={16} /> Nova seção
        </button>

        {newSectionMenuOpen && (
          <div className={chapterListPanelCss.chapterListNewChapterMenu}>
            {NEW_SECTION_OPTIONS.map(({ kind, label, hint, icon: Icon }) => (
              <button key={kind} type="button" onClick={() => void handleAddSection(kind, label)}>
                <Icon size={15} />
                <span><strong>{label}</strong><small>{hint}</small></span>
              </button>
            ))}
          </div>
        )}
      </div>
      {/* #endregion */}
    </aside>
  )
}
