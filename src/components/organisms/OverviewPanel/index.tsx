import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, AlignLeft, Box, CheckSquare, ChevronRight, CircleHelp, ImageIcon, Lightbulb, ListChecks, MapPin, Users, UserRound } from 'lucide-react'
import { subscribeToCharacters } from '@/services/firestore/characters'
import { useProjectStore } from '@/store/useProjectStore'
import type { Character } from '@/types'
import { overviewPanelCss as css } from './css'

function htmlToText(value: string) {
  const element = document.createElement('div')
  element.innerHTML = value
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
}

function countWords(value: string) {
  const text = htmlToText(value)
  return text ? text.split(/\s+/).filter(Boolean).length : 0
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function OverviewPanel() {
  const project = useProjectStore((state) => state.currentProject)
  const chapters = useProjectStore((state) => state.chapters)
  const [characters, setCharacters] = useState<Character[]>([])
  const [todayWords, setTodayWords] = useState(0)

  useEffect(() => {
    if (!project?.id) return
    return subscribeToCharacters(project.id, setCharacters)
  }, [project?.id])

  const totalWords = useMemo(
    () => chapters.reduce((total, chapter) => total + countWords(chapter.content), 0),
    [chapters],
  )

  useEffect(() => {
    if (!project?.id) return
    const day = new Date().toISOString().slice(0, 10)
    const key = `maibook:writing:${project.id}:${day}`
    const stored = window.localStorage.getItem(key)
    const baseline = stored ? Number(stored) : totalWords

    if (!stored) window.localStorage.setItem(key, String(totalWords))
    setTodayWords(Math.max(0, totalWords - baseline))
  }, [project?.id, totalWords])

  const pendingCharacters = characters.filter(
    (character) => !character.detailsAnalysis || !character.imageUrl,
  ).length
  const emptyChapters = chapters.filter((chapter) => countWords(chapter.content) === 0).length
  const pending = pendingCharacters + emptyChapters

  const stats = [
    { icon: ListChecks, label: 'Capítulos', value: chapters.length },
    { icon: AlignLeft, label: 'Palavras', value: totalWords },
    { icon: Users, label: 'Personagens', value: characters.length },
    { icon: MapPin, label: 'Lugares', value: 0 },
    { icon: Box, label: 'Itens', value: 0 },
    { icon: CircleHelp, label: 'Mistérios', value: 0 },
    { icon: CheckSquare, label: 'Pendências', value: pending },
  ]

  const insights = useMemo(() => {
    const items: Array<{ icon: typeof AlertTriangle; tone: 'warn' | 'info' | 'danger'; text: string }> = []
    const emptyChapters = chapters.filter((chapter) => !htmlToText(chapter.content))
    const withoutDetails = characters.filter((character) => !character.detailsAnalysis)
    const withoutImage = characters.filter((character) => !character.imageUrl)
    const withoutAliases = characters.filter((character) => !(character.aliases?.length))

    if (emptyChapters.length) {
      items.push({ icon: AlertTriangle, tone: 'warn', text: `${emptyChapters.length} capítulo${emptyChapters.length === 1 ? '' : 's'} ainda sem conteúdo.` })
    }
    if (withoutDetails.length) {
      items.push({ icon: UserRound, tone: 'info', text: `${withoutDetails.length} personagem${withoutDetails.length === 1 ? '' : 's'} aguardando análise da IA.` })
    }
    if (withoutImage.length) {
      items.push({ icon: ImageIcon, tone: 'info', text: `${withoutImage.length} personagem${withoutImage.length === 1 ? '' : 's'} sem imagem.` })
    }
    if (characters.length && withoutAliases.length === characters.length) {
      items.push({ icon: Lightbulb, tone: 'info', text: 'Nenhum personagem possui nomes alternativos cadastrados.' })
    }
    if (!items.length) {
      items.push({ icon: Lightbulb, tone: 'info', text: 'Tudo organizado por enquanto. Continue escrevendo!' })
    }
    return items.slice(0, 4)
  }, [chapters, characters])

  return (
    <aside className={`${css.panel} ${css.overviewPanel}`}>
      <div className={css.overviewPanelLabel}>Visão Geral</div>
      <ul className={css.overviewPanelStats}>
        {stats.map((stat) => (
          <li key={stat.label} title={stat.value === 0 && ['Lugares', 'Itens', 'Mistérios'].includes(stat.label) ? 'Esta coleção ainda não foi implementada no projeto.' : undefined}>
            <span className={css.overviewPanelStatName}><stat.icon size={15} /> {stat.label}</span>
            <span className={css.overviewPanelStatValue}>{formatNumber(stat.value)}</span>
          </li>
        ))}
      </ul>

      <div className={css.overviewPanelLabel}>Insights do seu livro</div>
      <ul className={css.overviewPanelInsights}>
        {insights.map((insight, index) => (
          <li key={`${insight.text}-${index}`} className={css.insightByTone[insight.tone]}>
            <insight.icon size={15} />
            <span>{insight.text}</span>
            <ChevronRight size={14} className={css.insightArrow} />
          </li>
        ))}
      </ul>

      <div className={css.overviewPanelLabel}>Hoje</div>
      <p className={css.overviewPanelTodayWords}>+ {formatNumber(todayWords)} palavras</p>
      <p className={css.overviewPanelStreak}>
        {todayWords > 0 ? '🔥 Você escreveu hoje' : 'Comece a escrever para registrar o progresso'}
      </p>

      <div className={css.progress}>
        <span style={{ width: `${Math.min(100, (totalWords / 80000) * 100)}%` }} />
      </div>
      <p className={css.goal}>{formatNumber(totalWords)} de 80.000 palavras</p>
    </aside>
  )
}
