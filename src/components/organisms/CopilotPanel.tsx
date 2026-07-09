import { useState } from 'react'
import { AlertTriangle, Lightbulb, MapPin, ImageIcon, Send, ChevronRight } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { useProjectStore } from '@/store/useProjectStore'

// #region Dados mockados dos insights
// Esses insights (avisos automáticos sobre inconsistências do livro)
// ainda não vêm de uma análise real — é conteúdo de exemplo só pra
// bater com o Figma. Depois dá pra gerar isso de verdade cruzando
// os dados de personagens/capítulos.
const MOCK_INSIGHTS = [
  { icon: AlertTriangle, tone: 'warn', text: 'Tomas aparece com duas idades diferentes.' },
  { icon: Lightbulb, tone: 'info', text: 'Ceren não é citada há 18 capítulos.' },
  { icon: MapPin, tone: 'danger', text: 'Demeres ainda não possui descrição.' },
  { icon: ImageIcon, tone: 'info', text: 'Existem 3 personagens sem imagem.' },
]
// #endregion

export function CopilotPanel() {
  // controla qual sub-aba está ativa: copiloto de IA ou notas manuais
  const [tab, setTab] = useState<'copiloto' | 'notas'>('copiloto')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)

  const activeChapter = useProjectStore((state) =>
    state.chapters.find((ch) => ch.id === state.activeChapterId),
  )

  // envia a pergunta do usuário pra IA, usando o capítulo atual como contexto
  async function handleAsk() {
    if (!question.trim()) return
    setLoading(true)
    try {
      const context = `Capítulo atual:\n${activeChapter?.content ?? ''}\n\nPergunta: ${question}`
      const response = await aiProvider.suggestIdea(context)
      setAnswer(response)
    } catch {
      setAnswer('Não consegui falar com a IA agora. Tente de novo em instantes.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <aside className="panel copilot-panel">
      {/* #region Abas Copiloto / Notas */}
      <div className="copilot-panel__tabs">
        <button
          className={tab === 'copiloto' ? 'copilot-tab active' : 'copilot-tab'}
          onClick={() => setTab('copiloto')}
        >
          IA Copiloto
        </button>
        <button
          className={tab === 'notas' ? 'copilot-tab active' : 'copilot-tab'}
          onClick={() => setTab('notas')}
        >
          Notas
        </button>
      </div>
      {/* #endregion */}

      {tab === 'copiloto' ? (
        <>
          {/* #region Mensagem de boas-vindas do copiloto */}
          <div className="copilot-panel__intro">
            <span className="copilot-panel__avatar">🤖</span>
            <p>
              Olá! Eu sou seu copiloto. Estou aqui para ajudar você a escrever e manter tudo em
              ordem.
            </p>
          </div>
          {/* #endregion */}

          {/* #region Insights do livro */}
          <div className="copilot-panel__insights-label">Insights do seu livro</div>
          <ul className="copilot-panel__insights">
            {MOCK_INSIGHTS.map((insight, i) => (
              <li key={i} className={`insight insight--${insight.tone}`}>
                <insight.icon size={15} />
                <span>{insight.text}</span>
                <ChevronRight size={14} className="insight__arrow" />
              </li>
            ))}
          </ul>
          {/* #endregion */}

          {/* #region Resposta da IA (quando existir) */}
          {answer && <div className="copilot-panel__answer">{answer}</div>}
          {/* #endregion */}

          {/* #region Campo de pergunta */}
          <div className="copilot-panel__ask">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Pergunte algo..."
              // permite enviar apertando Enter
              onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            />
            <button onClick={handleAsk} disabled={loading} aria-label="Enviar pergunta">
              <Send size={16} />
            </button>
          </div>
          {/* #endregion */}
        </>
      ) : (
        <p className="copilot-panel__empty">Suas anotações livres sobre este capítulo aparecerão aqui.</p>
      )}
    </aside>
  )
}
