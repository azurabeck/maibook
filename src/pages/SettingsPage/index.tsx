import { useState } from 'react'
import { Eye, EyeOff, KeyRound } from 'lucide-react'
import { validateGeminiKey } from '@/services/ai/gemini'
import { getUserGeminiKey, setUserGeminiKey } from '@/services/userSettings'
import { Button } from '@/components/atoms/Button/index'
import { FormField } from '@/components/molecules/FormField/index'
import { accountLayoutCss } from '@/components/templates/AccountLayout/css'
import { settingsPageCss } from './css'

export function SettingsPage() {
  // chave que está valendo hoje ('' = a da plataforma)
  const [savedKey, setSavedKey] = useState(getUserGeminiKey)
  const [key, setKey] = useState(savedKey)
  const [showKey, setShowKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = key.trim()
    if (!trimmed) return

    setSaving(true)
    setFeedback(null)
    try {
      // só salva se o Google aceitar a chave
      await validateGeminiKey(trimmed)
      setUserGeminiKey(trimmed)
      setSavedKey(trimmed)
      setKey(trimmed)
      setFeedback({ text: 'Chave salva. A IA do MAIBOOK já está usando a sua chave.' })
    } catch (err) {
      const reason = err instanceof Error && err.message.startsWith('Gemini') ? ` ${err.message}` : ''
      setFeedback({ text: `Não foi possível validar essa chave.${reason}`, error: true })
    } finally {
      setSaving(false)
    }
  }

  function handleRemove() {
    setUserGeminiKey('')
    setSavedKey('')
    setKey('')
    setFeedback({ text: 'Chave removida. A IA voltou a usar a chave da plataforma.' })
  }

  return (
    <>
      <section className={accountLayoutCss.card}>
        <span className={accountLayoutCss.cardLabel}>Configurações</span>
        <h1>Chave do Gemini</h1>
        <p className={accountLayoutCss.cardDescription}>
          A IA do MAIBOOK (revisão, copiloto, análises) usa o Gemini, do Google. Com a sua
          própria chave, o uso passa a contar na sua conta do Google, e não na da plataforma.
        </p>

        <h2>Como gerar a sua chave</h2>
        <ol className={settingsPageCss.steps}>
          <li>
            <span>
              Acesse o{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
                Google AI Studio
              </a>{' '}
              e entre com a sua conta Google.
            </span>
          </li>
          <li>
            <span>
              Clique em <strong>Criar chave de API</strong> (Create API key).
            </span>
          </li>
          <li>
            <span>Escolha um projeto do Google Cloud ou deixe o AI Studio criar um para você.</span>
          </li>
          <li>
            <span>
              Copie a chave gerada (começa com <strong>AIza</strong>) e cole no campo abaixo.
            </span>
          </li>
        </ol>

        <div className={settingsPageCss.status}>
          <KeyRound size={18} />
          <span>
            {savedKey
              ? 'A IA está usando a sua chave.'
              : 'A IA está usando a chave padrão da plataforma.'}
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={settingsPageCss.key}>
            <FormField
              id="gemini-key"
              label="Sua chave do Gemini"
              type={showKey ? 'text' : 'password'}
              placeholder="AIza..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className={settingsPageCss.keyToggle}
              onClick={() => setShowKey((current) => !current)}
              aria-label={showKey ? 'Esconder chave' : 'Mostrar chave'}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className={accountLayoutCss.cardActions}>
            <Button type="submit" disabled={saving || !key.trim() || key.trim() === savedKey}>
              {saving ? 'Validando...' : 'Salvar chave'}
            </Button>
            {savedKey && (
              <Button type="button" variant="secondary" onClick={handleRemove} disabled={saving}>
                Remover chave
              </Button>
            )}
            {feedback && (
              <p className={feedback.error ? accountLayoutCss.feedbackError : accountLayoutCss.feedback}>
                {feedback.text}
              </p>
            )}
          </div>
        </form>

        <p className={accountLayoutCss.cardDescription} style={{ margin: '20px 0 0' }}>
          A chave fica guardada só neste navegador. Em outro computador ou navegador, é preciso
          colar de novo.
        </p>
      </section>
    </>
  )
}
