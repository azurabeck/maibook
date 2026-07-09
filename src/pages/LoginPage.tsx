import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/services/firebase'
import { Button } from '@/components/atoms/Button'
import { FormField } from '@/components/molecules/FormField'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Toda vez que o usuário submete o form, essa função roda.
  // "e.preventDefault()" evita o comportamento padrão do HTML
  // (recarregar a página), já que quem cuida da navegação é o React.
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
    <div className="login-page">
      <h1>Entrar</h1>
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
        <Button type="submit">Entrar</Button>
      </form>
    </div>
  )
}
