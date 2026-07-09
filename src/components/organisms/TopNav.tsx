import { NavLink, useParams } from 'react-router-dom'
import { Sun, Moon, ChevronDown } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

// #region Configuração das abas
// Cada aba de topo do projeto. O "path" bate com as rotas filhas
// definidas em router/index.tsx (ex: /projeto/:id/capitulos)
const TABS = [
  { path: 'capitulos', label: 'Capítulos' },
  { path: 'estruturas', label: 'Estruturas' },
  { path: 'personagens', label: 'Personagens' },
  { path: 'timeline', label: 'Timeline' },
  { path: 'ideias', label: 'Ideias' },
]
// #endregion

export function TopNav() {
  const { theme, toggleTheme } = useTheme()
  const { projectId } = useParams()

  return (
    <header className="top-nav">
      {/* #region Logo */}
      <div className="top-nav__logo">MAIBOOK</div>
      {/* #endregion */}

      {/* #region Abas de navegação do projeto */}
      <nav className="top-nav__tabs">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/projeto/${projectId}/${tab.path}`}
            // aplica a classe "active" só na aba correspondente à rota atual
            className={({ isActive }) => (isActive ? 'top-nav__tab active' : 'top-nav__tab')}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      {/* #endregion */}

      {/* #region Ações (tema + avatar) */}
      <div className="top-nav__actions">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Alternar tema claro/escuro"
        >
          {/* mostra o ícone do que o usuário pode IR (lua = ir pro escuro) */}
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className="top-nav__avatar">
          <span className="avatar-circle">A</span>
          <ChevronDown size={14} />
        </button>
      </div>
      {/* #endregion */}
    </header>
  )
}
