import { useState } from 'react'
import { AlertTriangle, Lightbulb, MapPin, ImageIcon, Send, ChevronRight } from 'lucide-react'
import { aiProvider } from '@/services/ai'
import { useProjectStore } from '@/store/useProjectStore'
import { copilotPanelCss } from './css'

// #region Dados mockados dos insights
// Esses insights (avisos automáticos sobre inconsistências do livro)
// ainda não vêm de uma análise real — é conteúdo de exemplo só pra
// bater com o Figma. Depois dá pra gerar isso de verdade cruzando
// os dados de personagens/capítulos.
const MOCK_INSIGHTS: Array<{ icon: typeof AlertTriangle; tone: 'warn' | 'info' | 'danger'; text: string }> = [
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
    <aside className={copilotPanelCss.panel + ' ' + copilotPanelCss.copilotPanel}>
      {/* #region Abas Copiloto / Notas */}
      <div className={copilotPanelCss.copilotPanelTabs}>
        <button
          className={tab === 'copiloto' ? copilotPanelCss.copilotTabActive : copilotPanelCss.copilotTab}
          onClick={() => setTab('copiloto')}
        >
          IA Copiloto
        </button>
        <button
          className={tab === 'notas' ? copilotPanelCss.copilotTabActive : copilotPanelCss.copilotTab}
          onClick={() => setTab('notas')}
        >
          Notas
        </button>
      </div>
      {/* #endregion */}

      {tab === 'copiloto' ? (
        <>
          {/* #region Mensagem de boas-vindas do copiloto */}
          <div className={copilotPanelCss.copilotPanelIntro}>
            <span className={copilotPanelCss.copilotPanelAvatar}>🤖</span>
            <p>
              Olá! Eu sou seu copiloto. Estou aqui para ajudar você a escrever e manter tudo em
              ordem.
            </p>
          </div>
          {/* #endregion */}

          {/* #region Insights do livro */}
          <div className={copilotPanelCss.copilotPanelInsightsLabel}>Insights do seu livro</div>
          <ul className={copilotPanelCss.copilotPanelInsights}>
            {MOCK_INSIGHTS.map((insight, i) => (
              <li key={i} className={copilotPanelCss.insightByTone[insight.tone]}>
                <insight.icon size={15} />
                <span>{insight.text}</span>
                <ChevronRight size={14} className={copilotPanelCss.insightArrow} />
              </li>
            ))}
          </ul>
          {/* #endregion */}

          {/* #region Resposta da IA (quando existir) */}
          {answer && <div className={copilotPanelCss.copilotPanelAnswer}>{answer}</div>}
          {/* #endregion */}

          {/* #region Campo de pergunta */}
          <div className={copilotPanelCss.copilotPanelAsk}>
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
        <p className={copilotPanelCss.copilotPanelEmpty}>Suas anotações livres sobre este capítulo aparecerão aqui.</p>
      )}
    </aside>
  )
}
