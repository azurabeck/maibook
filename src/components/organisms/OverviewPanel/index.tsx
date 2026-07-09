import { ListChecks, AlignLeft, Users, MapPin, Box, CircleHelp, CheckSquare } from 'lucide-react'
import { overviewPanelCss } from './css'

// #region Dados mockados da visão geral
// Números de exemplo, iguais ao Figma. Depois esses valores vêm de
// contagens reais no Firestore (quantidade de capítulos, personagens
// cadastrados, soma de palavras de todos os capítulos, etc).
const STATS = [
  { icon: ListChecks, label: 'Capítulos', value: '42' },
  { icon: AlignLeft, label: 'Palavras', value: '121.430' },
  { icon: Users, label: 'Personagens', value: '83' },
  { icon: MapPin, label: 'Lugares', value: '19' },
  { icon: Box, label: 'Itens', value: '54' },
  { icon: CircleHelp, label: 'Mistérios', value: '12' },
  { icon: CheckSquare, label: 'Pendências', value: '6' },
]
// #endregion

export function OverviewPanel() {
  return (
    <aside className={overviewPanelCss.panel + ' ' + overviewPanelCss.overviewPanel}>
      {/* #region Lista de estatísticas */}
      <div className={overviewPanelCss.overviewPanelLabel}>Visão Geral</div>
      <ul className={overviewPanelCss.overviewPanelStats}>
        {STATS.map((stat) => (
          <li key={stat.label}>
            <span className={overviewPanelCss.overviewPanelStatName}>
              <stat.icon size={15} /> {stat.label}
            </span>
            <span className={overviewPanelCss.overviewPanelStatValue}>{stat.value}</span>
          </li>
        ))}
      </ul>
      {/* #endregion */}

      {/* #region Progresso de hoje */}
      <div className={overviewPanelCss.overviewPanelLabel}>Hoje</div>
      <p className={overviewPanelCss.overviewPanelTodayWords}>+ 2.143 palavras</p>
      <p className={overviewPanelCss.overviewPanelStreak}>🔥 Sequência de 14 dias</p>
      {/* #endregion */}
    </aside>
  )
}
