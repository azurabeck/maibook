import { useEffect } from 'react'
import { Navigate, Outlet, useParams } from 'react-router-dom'
import { TopNav } from '@/components/organisms/TopNav/index'
import { useProjectStore } from '@/store/useProjectStore'
import { useUiStore } from '@/store/useUiStore'
import { projectLayoutCss } from './css'

// Template: estrutura de qualquer página dentro de um projeto —
// barra superior fixa (TopNav) + conteúdo da aba ativa abaixo.
// <Outlet /> é onde o react-router renderiza a rota filha
// (ex: /projeto/:id/capitulos).
//
// Também é aqui que a gente "liga" a store no projeto certo: ao
// entrar em /projeto/:projectId, conectamos os listeners do
// Firestore (documento do projeto + subcoleção de capítulos). Todas
// as páginas filhas (Capítulos, Estruturas, etc.) só leem do
// useProjectStore, sem precisar saber de onde os dados vieram.
export function ProjectLayout() {
  const { projectId } = useParams()
  const loadProject = useProjectStore((state) => state.loadProject)
  const unloadProject = useProjectStore((state) => state.unloadProject)
  const projectStatus = useProjectStore((state) => state.projectStatus)
  // modo de foco: some com o cabeçalho pra sobrar mais espaço de leitura
  const focusMode = useUiStore((state) => state.focusMode)

  useEffect(() => {
    if (!projectId) return

    loadProject(projectId)
    // ao sair da página (ou trocar de projeto), encerra os listeners
    // do projeto anterior antes de abrir os do próximo
    return () => unloadProject()
  }, [projectId, loadProject, unloadProject])

  // projeto não existe (id errado) ou o usuário não tem acesso a ele
  // -> as Security Rules do Firestore bloqueiam a leitura, o que o
  // SDK enxerga como "documento não encontrado"
  if (projectStatus === 'not-found') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className={projectLayoutCss.projectLayout}>
      {!focusMode && <TopNav />}
      <main className={focusMode ? projectLayoutCss.projectLayoutContentFocus : projectLayoutCss.projectLayoutContent}>
        {projectStatus === 'loading' || projectStatus === 'idle' ? (
          <div className={projectLayoutCss.projectLayoutLoading}>Carregando projeto...</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  )
}
