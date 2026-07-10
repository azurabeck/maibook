import { useEffect, useRef, useState } from 'react'
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from 'react'
import { GripVertical, MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { chapterListPanelCss } from './css'

export function ChapterListPanel() {
  // pega do store o projeto atual, a lista de capítulos, qual está
  // ativo, e as ações disponíveis
  const {
    currentProject,
    chapters,
    activeChapterId,
    setActiveChapter,
    addChapter,
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
  const [dropPosition, setDropPosition] = useState<'before' | 'after'>('before')
  const [reordering, setReordering] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
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

  const orderedChapters = chapters.slice().sort((a, b) => a.order - b.order)

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
    if (!draggedChapterId || draggedChapterId === chapterId) return
    event.preventDefault()

    const bounds = event.currentTarget.getBoundingClientRect()
    const position = event.clientY < bounds.top + bounds.height / 2 ? 'before' : 'after'
    setDropTargetId(chapterId)
    setDropPosition(position)
    event.dataTransfer.dropEffect = 'move'
  }

  async function handleDrop(event: ReactDragEvent<HTMLLIElement>, targetChapterId: string) {
    event.preventDefault()
    const sourceChapterId = draggedChapterId || event.dataTransfer.getData('text/plain')
    if (!sourceChapterId || sourceChapterId === targetChapterId) {
      resetDragState()
      return
    }

    const ids = orderedChapters.map((chapter) => chapter.id)
    const sourceIndex = ids.indexOf(sourceChapterId)
    const targetIndex = ids.indexOf(targetChapterId)
    if (sourceIndex < 0 || targetIndex < 0) {
      resetDragState()
      return
    }

    ids.splice(sourceIndex, 1)
    const adjustedTargetIndex = ids.indexOf(targetChapterId)
    const insertIndex = dropPosition === 'after' ? adjustedTargetIndex + 1 : adjustedTargetIndex
    ids.splice(insertIndex, 0, sourceChapterId)

    setReordering(true)
    resetDragState()
    try {
      await reorderChapters(ids)
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

  return (
    <aside className={chapterListPanelCss.panel + ' ' + chapterListPanelCss.chapterList}>
      {/* #region Projeto atual */}
      <div className={chapterListPanelCss.chapterListProject}>
        <span className={chapterListPanelCss.chapterListProjectLabel}>Projeto atual</span>
        <button className={chapterListPanelCss.chapterListProjectName}>
          {currentProject?.title ?? 'Carregando...'} <span className={chapterListPanelCss.chevron}>⌄</span>
        </button>
      </div>
      {/* #endregion */}

      {/* #region Lista de capítulos */}
      <div className={chapterListPanelCss.chapterListSectionLabel}>Capítulos</div>
      <ul className={chapterListPanelCss.chapterListItems}>
        {orderedChapters.map((chapter) => (
            <li
              key={chapter.id}
              className={[
                chapterListPanelCss.chapterListRow,
                draggedChapterId === chapter.id ? chapterListPanelCss.chapterListRowDragging : '',
                dropTargetId === chapter.id
                  ? dropPosition === 'before'
                    ? chapterListPanelCss.chapterListRowDropBefore
                    : chapterListPanelCss.chapterListRowDropAfter
                  : '',
              ].filter(Boolean).join(' ')}
              onDragOver={(event) => handleDragOver(event, chapter.id)}
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
                  <button
                    className={chapterListPanelCss.chapterListDragHandle}
                    type="button"
                    draggable={!reordering}
                    onDragStart={(event) => handleDragStart(event, chapter.id)}
                    onDragEnd={resetDragState}
                    aria-label={`Arrastar ${chapter.title}`}
                    title="Arraste para reorganizar"
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
          ))}
      </ul>
      {/* #endregion */}

      {/* #region Novo capítulo */}
      <button className={chapterListPanelCss.chapterListAdd} onClick={addChapter}>
        <Plus size={16} /> Novo Capítulo
      </button>
      {/* #endregion */}
    </aside>
  )
}
