import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth'
import { BookOpen, Moon, Sparkles, Sun } from 'lucide-react'
import { auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button/index'
import { FormField } from '@/components/molecules/FormField/index'
import { useTheme } from '@/contexts/ThemeContext'
import { loginPageCss } from './css'
import type { AuthMode } from './type'

const googleProvider = new GoogleAuthProvider()

function getAuthErrorMessage(err: unknown, mode: AuthMode): string | null {
  const code = err instanceof FirebaseError ? err.code : ''
  switch (code) {
    // O usuário fechou o popup do Google: não é um erro pra mostrar.
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return null
    case 'auth/popup-blocked':
      return 'O navegador bloqueou o popup do Google. Libere popups e tente de novo.'
    case 'auth/email-already-in-use':
      return 'Já existe uma conta com este e-mail.'
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.'
    case 'auth/invalid-email':
      return 'E-mail inválido.'
    case 'auth/account-exists-with-different-credential':
      return 'Este e-mail já está cadastrado com outro método de login.'
    case 'auth/operation-not-allowed':
      return 'Este método de login não está habilitado no Firebase.'
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.'
    default:
      return mode === 'login'
        ? 'E-mail ou senha inválidos.'
        : 'Não foi possível criar a conta. Tente novamente.'
  }
}

export function LoginPage() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isLogin = mode === 'login'

  async function runAuth(action: () => Promise<unknown>) {
    setError(null)
    setLoading(true)
    try {
      await action()
      navigate('/dashboard')
    } catch (err) {
      setError(getAuthErrorMessage(err, mode))
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    runAuth(() =>
      isLogin
        ? signInWithEmailAndPassword(auth, email, password)
        : createUserWithEmailAndPassword(auth, email, password),
    )
  }

  // Com o Google, login e cadastro são a mesma chamada: se a conta
  // ainda não existe no Firebase Auth, ela é criada na hora.
  function handleGoogle() {
    runAuth(() => signInWithPopup(auth, googleProvider))
  }

  function toggleMode() {
    setMode(isLogin ? 'signup' : 'login')
    setError(null)
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
            <span>{isLogin ? 'Login' : 'Cadastro'}</span>
            <h2>{isLogin ? 'Entrar no MAIBOOK' : 'Criar sua conta'}</h2>
            <p>
              {isLogin
                ? 'Use sua conta Google ou o e-mail cadastrado.'
                : 'Cadastre-se com sua conta Google ou com e-mail e senha.'}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className={loginPageCss.google}
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z"
              />
            </svg>
            {isLogin ? 'Entrar com Google' : 'Cadastrar com Google'}
          </Button>

          <div className={loginPageCss.divider}>
            <span>ou</span>
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
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {error && <p className={loginPageCss.error}>{error}</p>}
            <Button type="submit" className={loginPageCss.submit} disabled={loading}>
              {isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className={loginPageCss.switch}>
            {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
            <button type="button" onClick={toggleMode}>
              {isLogin ? 'Criar conta' : 'Entrar'}
            </button>
          </p>
        </section>
      </main>
    </div>
  )
}
