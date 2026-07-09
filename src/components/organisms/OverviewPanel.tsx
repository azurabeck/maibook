import { ListChecks, AlignLeft, Users, MapPin, Box, CircleHelp, CheckSquare } from 'lucide-react'

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
    <aside className="panel overview-panel">
      {/* #region Lista de estatísticas */}
      <div className="overview-panel__label">Visão Geral</div>
      <ul className="overview-panel__stats">
        {STATS.map((stat) => (
          <li key={stat.label}>
            <span className="overview-panel__stat-name">
              <stat.icon size={15} /> {stat.label}
            </span>
            <span className="overview-panel__stat-value">{stat.value}</span>
          </li>
        ))}
      </ul>
      {/* #endregion */}

      {/* #region Progresso de hoje */}
      <div className="overview-panel__label">Hoje</div>
      <p className="overview-panel__today-words">+ 2.143 palavras</p>
      <p className="overview-panel__streak">🔥 Sequência de 14 dias</p>
      {/* #endregion */}
    </aside>
  )
}
