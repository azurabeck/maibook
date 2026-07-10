import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/organisms/TopNav/index'
import { projectLayoutCss } from './css'

// Template: estrutura de qualquer página dentro de um projeto —
// barra superior fixa (TopNav) + conteúdo da aba ativa abaixo.
// <Outlet /> é onde o react-router renderiza a rota filha
// (ex: /projeto/:id/capitulos).
export function ProjectLayout() {
  return (
    <div className={projectLayoutCss.projectLayout}>
      <TopNav />
      <main className={projectLayoutCss.projectLayoutContent}>
        <Outlet />
      </main>
    </div>
  )
}
