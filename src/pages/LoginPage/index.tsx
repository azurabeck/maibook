import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { BookOpen, Moon, Sparkles, Sun } from 'lucide-react'
import { auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button/index'
import { FormField } from '@/components/molecules/FormField/index'
import { useTheme } from '@/contexts/ThemeContext'
import { loginPageCss } from './css'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError('E-mail ou senha inválidos.')
    }
  }

  return (
    <div className={loginPageCss.layout}>
      <header className={loginPageCss.topNav}>
        <Link to="/" className={loginPageCss.topNavLogo} aria-label="MAIBOOK início">
          MAIBOOK
        </Link>

        <div className={loginPageCss.topNavActions}>
          <button
            className={loginPageCss.themeToggle}
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/" className={loginPageCss.navTab}>
            Voltar
          </Link>
        </div>
      </header>

      <main className={loginPageCss.page}>
        <section className={loginPageCss.copy}>
          <span className={loginPageCss.eyebrow}>
            <Sparkles size={16} /> Área do autor
          </span>
          <h1>Volte para o seu livro sem perder o ritmo.</h1>
          <p>
            Entre para acessar seus projetos, capítulos, personagens e o copiloto criativo do
            MAIBOOK.
          </p>

          <div className={loginPageCss.note}>
            <BookOpen size={20} />
            <span>Seu dashboard fica logo depois do login, com acesso rápido aos projetos.</span>
          </div>
        </section>

        <section className={loginPageCss.card}>
          <div className={loginPageCss.cardHeader}>
            <span>Login</span>
            <h2>Entrar no MAIBOOK</h2>
            <p>Use o e-mail cadastrado no Firebase Auth.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormField
              id="email"
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormField
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className={loginPageCss.error}>{error}</p>}
            <Button type="submit" className={loginPageCss.submit}>
              Entrar
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
