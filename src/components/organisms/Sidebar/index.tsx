import { NavLink } from 'react-router-dom'
import { sidebarCss } from './css'

// Um ORGANISMO já é um pedaço "completo" de interface, com várias
// moléculas/átomos juntos e, às vezes, alguma lógica própria
// (aqui, por exemplo, sabe quais são as rotas do projeto).

const TABS = [
  { path: 'escrever', label: '✍️ Escrever' },
  { path: 'personagens', label: '🧑 Personagens' },
  { path: 'locais', label: '🗺️ Locais' },
  { path: 'timeline', label: '📅 Timeline' },
  { path: 'imagens', label: '🖼️ Imagens' },
  { path: 'capitulos', label: '📖 Capítulos' },
]

export function Sidebar() {
  return (
    <nav className={sidebarCss.sidebar}>
      <ul>
        {TABS.map((tab) => (
          <li key={tab.path}>
            {/* NavLink é como um <a>, mas sabe se a rota atual
                bate com o "to" e aplica automaticamente uma
                classe "active" (útil pra destacar a aba ativa) */}
            <NavLink
              to={tab.path}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {tab.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
