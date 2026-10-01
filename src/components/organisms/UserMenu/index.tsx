import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { auth } from '@/services/firebase'
import { Avatar } from '@/components/atoms/Avatar/index'
import { useAuthStore } from '@/store/useAuthStore'
import { userMenuCss } from './css'

// Avatar do cabeçalho + menu suspenso da conta (perfil, configurações
// e sair). Usado em todo cabeçalho de quem está logado.
export function UserMenu() {
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  const name = user?.displayName || user?.email || 'Autor'

  // fecha sozinho ao trocar de rota
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: globalThis.MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  async function handleSignOut() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className={userMenuCss.root} ref={rootRef}>
      <button
        type="button"
        className={userMenuCss.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir menu da conta"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar name={name} imageUrl={user?.photoURL} />
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className={userMenuCss.dropdown} role="menu">
          <div className={userMenuCss.identity}>
            <strong>{user?.displayName || 'Autor'}</strong>
            {user?.email && <span>{user.email}</span>}
          </div>

          <Link to="/perfil" className={userMenuCss.item} role="menuitem">
            <UserRound size={16} /> Meu perfil
          </Link>
          <Link to="/configuracoes" className={userMenuCss.item} role="menuitem">
            <Settings size={16} /> Configurações
          </Link>
          <button type="button" className={userMenuCss.itemDanger} role="menuitem" onClick={handleSignOut}>
            <LogOut size={16} /> Sair
          </button>
        </div>
      )}
    </div>
  )
}
