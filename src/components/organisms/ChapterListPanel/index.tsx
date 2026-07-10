import { useEffect, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'
import { MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react'
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
    renameCurrentProject,
    chaptersError,
  } = useProjectStore()

  // #region Estado do menu de contexto (3 pontinhos)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)
  // #endregion

  // #region Estado de edição do nome do projeto
  const [isEditingProjectName, setIsEditingProjectName] = useState(false)
  const [projectNameValue, setProjectNameValue] = useState('')

  function startEditingProjectName() {
    if (!currentProject) return
    setProjectNameValue(currentProject.title)
    setIsEditingProjectName(true)
  }

  function commitProjectName() {
    if (projectNameValue.trim()) {
      renameCurrentProject(projectNameValue.trim())
    }
    setIsEditingProjectName(false)
  }
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

  return (
    <aside className={chapterListPanelCss.panel + ' ' + chapterListPanelCss.chapterList}>
      {/* #region Projeto atual */}
      <div className={chapterListPanelCss.chapterListProject}>
        <span className={chapterListPanelCss.chapterListProjectLabel}>Projeto atual</span>
        {isEditingProjectName ? (
          <input
            className={chapterListPanelCss.chapterListRenameInput}
            value={projectNameValue}
            autoFocus
            onChange={(e) => setProjectNameValue(e.target.value)}
            onBlur={commitProjectName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitProjectName()
              if (e.key === 'Escape') setIsEditingProjectName(false)
            }}
          />
        ) : (
          <button
            className={chapterListPanelCss.chapterListProjectName}
            onClick={startEditingProjectName}
            title="Clique para renomear o projeto"
          >
            {currentProject?.title ?? 'Carregando...'} <Pencil size={12} />
          </button>
        )}
      </div>
      {/* #endregion */}

      {/* #region Lista de capítulos */}
      <div className={chapterListPanelCss.chapterListSectionLabel}>Capítulos</div>
      <ul className={chapterListPanelCss.chapterListItems}>
        {chapters
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((chapter) => (
            <li key={chapter.id} className={chapterListPanelCss.chapterListRow}>
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
      {chaptersError && <p className={chapterListPanelCss.chapterListError}>{chaptersError}</p>}
      {/* #endregion */}
    </aside>
  )
}
