import { useEffect, useMemo, useState } from 'react'
import { AlignLeft, Box, CheckSquare, CircleHelp, ListChecks, MapPin, Users } from 'lucide-react'
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
