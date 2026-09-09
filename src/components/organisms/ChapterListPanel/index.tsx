import { useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import {
  GripVertical,
  MoreVertical,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import type { ChapterOrderUpdate } from '@/services/firestore/chapters'
import type { Chapter, ChapterPageType } from '@/types'
import { chapterListPanelCss } from './css'

// Chave do localStorage que guarda quais capítulos-pai estão
// recolhidos — é só uma conveniência visual por navegador, não
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

function buildChapterTree(chapters: Chapter[], collapsedIds: Set<string>): ChapterTreeRow[] {
  const childrenByParent = new Map<string | undefined, Chapter[]>()
  for (const chapter of chapters) {
    const key = chapter.parentId ?? undefined
    const siblings = childrenByParent.get(key)
    if (siblings) siblings.push(chapter)
    else childrenByParent.set(key, [chapter])
  }
  for (const siblings of childrenByParent.values()) siblings.sort((a, b) => a.order - b.order)

  const rows: ChapterTreeRow[] = []

  function visit(parentId: string | undefined, depth: number) {
    for (const chapter of childrenByParent.get(parentId) ?? []) {
      const children = childrenByParent.get(chapter.id) ?? []
      rows.push({ chapter, depth, hasChildren: children.length > 0 })
      if (children.length > 0 && !collapsedIds.has(chapter.id)) {
        visit(chapter.id, depth + 1)
      }
    }
  }

  visit(undefined, 0)
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

// Opções oferecidas ao criar um capítulo novo — ver ChapterPageType.
const NEW_CHAPTER_OPTIONS: Array<{ pageType: ChapterPageType; label: string; hint: string; icon: typeof FileText }> = [
  { pageType: 'text', label: 'Página de texto', hint: 'O padrão: escreva normalmente', icon: FileText },
  { pageType: 'image', label: 'Imagem de página inteira', hint: 'Uma imagem ocupando toda a página', icon: ImageIcon },
  { pageType: 'background', label: 'Texto com fundo', hint: 'Escreva sobre uma imagem de fundo', icon: Layers },
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

  // #region Estado do popover "Novo Capítulo" (escolha do tipo de página)
  const [newChapterMenuOpen, setNewChapterMenuOpen] = useState(false)
  const newChapterMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!newChapterMenuOpen) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (newChapterMenuRef.current && !newChapterMenuRef.current.contains(event.target as Node)) {
        setNewChapterMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [newChapterMenuOpen])

  function handleAddChapter(pageType: ChapterPageType) {
    setNewChapterMenuOpen(false)
    void addChapter(pageType)
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

  function toggleCollapsed(chapterId: string) {
    setCollapsedIds((current) => {
      const next = new Set(current)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
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

  // #region Fechar o menu ao clicar fora dele
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

  const chapterRows = buildChapterTree(chapters, collapsedIds)

  // #region Arrastar e soltar — reordena como irmão (antes/depois) ou
  // aninha como filho (em cima), igual ao painel de camadas do Figma
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

    const siblings = chapters
      .filter((chapter) => chapter.id !== sourceChapterId && (chapter.parentId ?? undefined) === newParentId)
      .sort((a, b) => a.order - b.order)

    let insertIndex = siblings.length
    if (position !== 'inside') {
      const targetIndex = siblings.findIndex((chapter) => chapter.id === targetChapterId)
      insertIndex = position === 'after' ? targetIndex + 1 : targetIndex
    }
    siblings.splice(insertIndex, 0, source)

    const updates: ChapterOrderUpdate[] = siblings.map((chapter, index) => ({
      id: chapter.id,
      order: index + 1,
      ...(chapter.id === sourceChapterId ? { parentId: newParentId ?? null } : {}),
    }))

    setReordering(true)
    try {
      await reorderChapters(updates)
      // expande o novo pai pra mostrar o capítulo recém-aninhado
      if (position === 'inside') {
        setCollapsedIds((current) => {
          if (!current.has(target.id)) return current
          const next = new Set(current)
          next.delete(target.id)
          return next
        })
      }
    } catch {
      window.alert('Não foi possível salvar a nova ordem dos capítulos.')
    } finally {
      setReordering(false)
    }
  }

  function resetDragState() {
    setDraggedChapterId(null)
    setDropTargetId(null)
    setDropPosition('before')
  }
  // #endregion

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

      {/* #region Lista de capítulos */}
      <div className={chapterListPanelCss.chapterListSectionLabel}>Capítulos</div>
      <ul className={chapterListPanelCss.chapterListItems}>
        {chapterRows.map(({ chapter, depth, hasChildren }) => {
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
                    title="Arraste para reorganizar (solte em cima de outro capítulo para aninhar)"
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

                  {/* #region Menu suspenso: Renomear / Deletar */}
                  {openMenuId === chapter.id && (
                    <div className={chapterListPanelCss.chapterListMenu} ref={menuRef}>
                      <button onClick={() => startRename(chapter.id, chapter.title)}>
                        <Pencil size={14} /> Renomear
                      </button>
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
        })}
      </ul>
      {/* #endregion */}

      {/* #region Novo capítulo */}
      <div className={chapterListPanelCss.chapterListNewChapter} ref={newChapterMenuRef}>
        <button
          className={chapterListPanelCss.chapterListAdd}
          type="button"
          onClick={() => setNewChapterMenuOpen((current) => !current)}
        >
          <Plus size={16} /> Novo Capítulo
        </button>

        {newChapterMenuOpen && (
          <div className={chapterListPanelCss.chapterListNewChapterMenu}>
            {NEW_CHAPTER_OPTIONS.map(({ pageType, label, hint, icon: Icon }) => (
              <button key={pageType} type="button" onClick={() => handleAddChapter(pageType)}>
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
