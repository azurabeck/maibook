import { useState } from 'react'
import { Button } from '@/components/atoms/Button/index'
import { aiProvider } from '@/services/ai'
import { aiAssistPanelCss } from './css'

// Esse organismo é a peça-chave da sua ideia: "a IA pode ajudar em
// cada aba". Ele recebe o texto atual (contextText) e o tipo de
// ajuda desejada, chama o serviço de IA, e mostra o resultado.
// Como ele é genérico, dá pra reaproveitar na aba de Escrever,
// Personagens, Locais, etc — só muda o "contextText" que cada
// aba passa pra ele.

interface AiAssistPanelProps {
  contextText: string
  mode: 'grammar' | 'idea'
}

export function AiAssistPanel({ contextText, mode }: AiAssistPanelProps) {
  // useState cria uma "variável de estado": quando ela muda,
  // o React re-renderiza o componente automaticamente.
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAskAi() {
    setLoading(true)
    setError(null)
    try {
      const response =
        mode === 'grammar'
          ? await aiProvider.reviewGrammar(contextText)
          : await aiProvider.suggestIdea(contextText)
      setResult(response)
    } catch (err) {
      setError('Não foi possível falar com a IA agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={aiAssistPanelCss.aiPanel}>
      <Button onClick={handleAskAi} disabled={loading || !contextText}>
        {loading
          ? 'Pensando...'
          : mode === 'grammar'
            ? 'Revisar gramática'
            : 'Sugerir ideias'}
      </Button>

      {error && <p className={aiAssistPanelCss.aiPanelError}>{error}</p>}

      {result && (
        <div className={aiAssistPanelCss.aiPanelResult}>
          <p>{result}</p>
        </div>
      )}
    </div>
  )
}
