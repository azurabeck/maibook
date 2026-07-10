import { createBrowserRouter, Navigate } from 'react-router-dom'
import { PublicPage } from '@/pages/PublicPage/index'
import { LoginPage } from '@/pages/LoginPage/index'
import { DashboardPage } from '@/pages/DashboardPage/index'
import { ProjectLayout } from '@/components/templates/ProjectLayout/index'
import { ChaptersPage } from '@/pages/project/ChaptersPage/index'
import { StructurePage } from '@/pages/project/StructurePage/index'
import { CharactersPage } from '@/pages/project/CharactersPage/index'
import { TimelinePage } from '@/pages/project/TimelinePage/index'
import { IdeasPage } from '@/pages/project/IdeasPage/index'

// createBrowserRouter define TODAS as rotas (URLs) da aplicação de
// forma declarativa. Rotas "children" (filhas) renderizam dentro do
// <Outlet /> do componente pai (veja ProjectLayout.tsx).
export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/projeto/:projectId',
    element: <ProjectLayout />,
    children: [
      // ao entrar em /projeto/:id "puro", redireciona pra Capítulos
      { index: true, element: <Navigate to="capitulos" replace /> },
      { path: 'capitulos', element: <ChaptersPage /> },
      { path: 'estruturas', element: <StructurePage /> },
      { path: 'personagens', element: <CharactersPage /> },
      { path: 'timeline', element: <TimelinePage /> },
      { path: 'ideias', element: <IdeasPage /> },
    ],
  },
])
