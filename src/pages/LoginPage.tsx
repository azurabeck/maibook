import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { BookOpen, Moon, Sparkles, Sun } from 'lucide-react'
import { auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'
import { useTheme } from '@/contexts/ThemeContext'

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
    <div className="auth-layout">
      <header className="top-nav top-nav--auth">
        <Link to="/" className="top-nav__logo" aria-label="MAIBOOK início">
          MAIBOOK
        </Link>

        <div className="top-nav__actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label="Alternar tema claro/escuro"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link to="/" className="top-nav__tab">
            Voltar
          </Link>
        </div>
      </header>

      <main className="auth-page">
        <section className="auth-copy">
          <span className="public-hero__eyebrow">
            <Sparkles size={16} /> Área do autor
          </span>
          <h1>Volte para o seu livro sem perder o ritmo.</h1>
          <p>
            Entre para acessar seus projetos, capítulos, personagens e o copiloto criativo do
            MAIBOOK.
          </p>

          <div className="auth-copy__note panel">
            <BookOpen size={20} />
            <span>Seu dashboard fica logo depois do login, com acesso rápido aos projetos.</span>
          </div>
        </section>

        <section className="login-card panel">
          <div className="login-card__header">
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
            {error && <p className="error">{error}</p>}
            <Button type="submit" className="login-card__submit">
              Entrar
            </Button>
          </form>
        </section>
      </main>
    </div>
  )
}
