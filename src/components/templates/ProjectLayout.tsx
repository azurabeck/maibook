import { Outlet } from 'react-router-dom'
import { TopNav } from '@/components/organisms/TopNav'

// Template: estrutura de qualquer página dentro de um projeto —
// barra superior fixa (TopNav) + conteúdo da aba ativa abaixo.
// <Outlet /> é onde o react-router renderiza a rota filha
// (ex: /projeto/:id/capitulos).
export function ProjectLayout() {
  return (
    <div className="project-layout">
      <TopNav />
      <main className="project-layout__content">
        <Outlet />
      </main>
    </div>
  )
}
