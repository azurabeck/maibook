import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { Sun, Moon, ChevronDown, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { topNavCss } from './css'

// #region Configuração das abas
// Cada aba de topo do projeto. O "path" bate com as rotas filhas
// definidas em router/index.tsx (ex: /projeto/:id/capitulos)
const TABS = [
  { path: 'capitulos', label: 'Capítulos' },
  { path: 'estruturas', label: 'Estruturas' },
  { path: 'personagens', label: 'Personagens' },
  { path: 'lugares', label: 'Lugares' },
  { path: 'timeline', label: 'Timeline' },
  { path: 'ideias', label: 'Ideias' },
]
// #endregion

export function TopNav() {
  const { theme, toggleTheme } = useTheme()
  const { projectId } = useParams()
  const location = useLocation()

  // #region Menu mobile (as abas somem em telas pequenas — ver css —
  // e viram esse menu suspenso aberto pelo botão de hambúrguer)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // fecha sozinho ao trocar de rota (clicar num link já fecha, mas
  // isso cobre navegação por outros meios, ex: botão voltar)
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!mobileMenuOpen) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileMenuOpen])
  // #endregion

  return (
    <header className={topNavCss.topNav}>
      {/* #region Logo: leva de volta pro Dashboard (mesma tela de depois do login) */}
      <Link to="/dashboard" className={topNavCss.topNavLogo}>MAIBOOK</Link>
      {/* #endregion */}

      {/* #region Abas de navegação do projeto (escondidas em telas pequenas) */}
      <nav className={topNavCss.topNavTabs}>
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

      {/* #region Botão de menu (só aparece em telas pequenas) */}
      <button
        type="button"
        className={topNavCss.mobileMenuButton}
        onClick={() => setMobileMenuOpen((current) => !current)}
        aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu de navegação'}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
      </button>
      {/* #endregion */}

      {/* #region Ações (tema + avatar) */}
      <div className={topNavCss.topNavActions}>
        <button
          className={topNavCss.themeToggle}
          onClick={toggleTheme}
          aria-label="Alternar tema claro/escuro"
        >
          {/* mostra o ícone do que o usuário pode IR (lua = ir pro escuro) */}
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button className={topNavCss.topNavAvatar}>
          <span className={topNavCss.avatarCircle}>A</span>
          <ChevronDown size={14} />
        </button>
      </div>
      {/* #endregion */}

      {/* #region Menu suspenso mobile: mesmas abas, em lista */}
      {mobileMenuOpen && (
        <div className={topNavCss.mobileMenu} ref={mobileMenuRef}>
          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={`/projeto/${projectId}/${tab.path}`}
              className={({ isActive }) => (isActive ? topNavCss.mobileMenuLinkActive : topNavCss.mobileMenuLink)}
              onClick={() => setMobileMenuOpen(false)}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      )}
      {/* #endregion */}
    </header>
  )
}
