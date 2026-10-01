import { Link, NavLink, Navigate, Outlet } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'
import { UserMenu } from '@/components/organisms/UserMenu/index'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuthStore } from '@/store/useAuthStore'
import { accountLayoutCss } from './css'

const TABS = [
  { path: '/dashboard', label: 'Projetos' },
  { path: '/perfil', label: 'Meu perfil' },
  { path: '/configuracoes', label: 'Configurações' },
]

// Template das páginas da conta (Meu perfil, Configurações): mesmo
// cabeçalho do Dashboard + conteúdo da rota filha no <Outlet />.
// Só renderiza a página depois de saber quem está logado — quem não
// está é mandado pro login.
export function AccountLayout() {
  const { theme, toggleTheme } = useTheme()
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)

  if (status === 'ready' && !user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className={accountLayoutCss.shell}>
      <header className={accountLayoutCss.topNav}>
        <Link to="/dashboard" className={accountLayoutCss.topNavLogo} aria-label="MAIBOOK dashboard">
          MAIBOOK
        </Link>

        <nav className={accountLayoutCss.navTabs} aria-label="Navegação da conta">
          {TABS.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) => (isActive ? 'top-nav__tab active' : 'top-nav__tab')}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        <div className={accountLayoutCss.topNavActions}>
          <button
            className={accountLayoutCss.themeToggle}
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <UserMenu />
        </div>
      </header>

      {status === 'loading' ? (
        <div className={accountLayoutCss.loading}>Carregando...</div>
      ) : (
        <main className={accountLayoutCss.page}>
          <Outlet />
        </main>
      )}
    </div>
  )
}
